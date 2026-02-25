import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ShoppingCart, Calendar, Package } from 'lucide-react';
import type { useInventory } from '@/hooks/useInventory';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SalesProps {
  inventory: ReturnType<typeof useInventory>;
}

export default function Sales({ inventory }: SalesProps) {
  const { productsWithMetrics, sales, addSale } = inventory;
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleSubmit = () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      toast.error('Pilih produk dan masukkan jumlah yang valid');
      return;
    }

    const product = productsWithMetrics.find(p => p.id === selectedProduct);
    if (!product) return;

    if (Number(quantity) > product.currentStock) {
      toast.error(`Stok tidak cukup! Stok tersedia: ${product.currentStock}`);
      return;
    }

    addSale({
      productId: selectedProduct,
      quantity: Number(quantity),
      date: new Date(saleDate),
      unitPrice: product.price,
    });

    toast.success(`Penjualan ${product.name} (${quantity} unit) berhasil dicatat`);
    setSelectedProduct('');
    setQuantity('');
  };

  const getProductName = (productId: string) => {
    return productsWithMetrics.find(p => p.id === productId)?.name || 'Unknown';
  };

  const getProductSKU = (productId: string) => {
    return productsWithMetrics.find(p => p.id === productId)?.sku || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Input Penjualan Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Produk</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {productsWithMetrics.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name} (Stok: {product.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                min="1"
                placeholder="Jumlah unit"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={!selectedProduct || !quantity}
              >
                <ShoppingCart className="w-4 h-4" />
                Catat Penjualan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Riwayat Penjualan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tanggal</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama Produk</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Jumlah</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Harga Satuan</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.slice(0, 50).map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(sale.date, 'dd MMM yyyy', { locale: id })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{getProductSKU(sale.productId)}</td>
                    <td className="py-3 px-4">{getProductName(sale.productId)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{sale.quantity} unit</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      Rp {sale.unitPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      Rp {(sale.quantity * sale.unitPrice).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedSales.length > 50 && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Menampilkan 50 dari {sortedSales.length} transaksi
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sales Summary by Product */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ringkasan Penjualan per Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama Produk</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Total Terjual</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Transaksi</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {productsWithMetrics.map((product) => {
                  const productSales = sales.filter(s => s.productId === product.id);
                  const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
                  const totalRevenue = productSales.reduce((sum, s) => sum + (s.quantity * s.unitPrice), 0);
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{product.sku}</td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700">{totalSold} unit</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{productSales.length}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
