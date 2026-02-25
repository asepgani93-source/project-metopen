import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, AlertTriangle, Info, Package, TrendingDown } from 'lucide-react';
import type { useInventory } from '@/hooks/useInventory';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface SafetyStockROPProps {
  inventory: ReturnType<typeof useInventory>;
}

export default function SafetyStockROP({ inventory }: SafetyStockROPProps) {
  const { productsWithMetrics } = inventory;
  const [selectedProductId, setSelectedProductId] = useState(productsWithMetrics[0]?.id || '');
  
  const selectedProduct = productsWithMetrics.find(p => p.id === selectedProductId);

  // Prepare comparison data for all products
  const comparisonData = productsWithMetrics.map(p => ({
    name: p.sku,
    stock: p.currentStock,
    rop: p.reorderPoint,
    safetyStock: p.safetyStock,
    status: p.status,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Safety Stock & Reorder Point</h2>
          <p className="text-sm text-slate-500">Perhitungan stok cadangan dan threshold pemesanan</p>
        </div>
        
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            {productsWithMetrics.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Formula Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-800">Rumus Safety Stock</p>
                <div className="mt-2 p-3 bg-white rounded-lg font-mono text-sm">
                  SS = (D<sub>max</sub> - D<sub>avg</sub>) × LT
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  Stok cadangan untuk mengantisipasi fluktuasi permintaan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800">Rumus Reorder Point</p>
                <div className="mt-2 p-3 bg-white rounded-lg font-mono text-sm">
                  ROP = (D<sub>avg</sub> × LT) + SS
                </div>
                <p className="text-sm text-orange-600 mt-2">
                  Threshold stok minimum untuk trigger pemesanan ulang
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedProduct && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Permintaan Maks (D<sub>max</sub>)</p>
                <p className="text-2xl font-bold text-slate-800">
                  {Math.max(...selectedProduct.salesHistory.map(s => s.quantity))} unit
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Permintaan Rata-rata (D<sub>avg</sub>)</p>
                <p className="text-2xl font-bold text-slate-800">
                  {selectedProduct.wmaForecast.toFixed(1)} unit/minggu
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Lead Time (LT)</p>
                <p className="text-2xl font-bold text-slate-800">
                  {selectedProduct.leadTime} hari
                </p>
                <p className="text-xs text-slate-400">
                  = {(selectedProduct.leadTime / 7).toFixed(1)} minggu
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <p className="text-sm text-purple-600">Safety Stock</p>
                <p className="text-2xl font-bold text-purple-700">
                  {selectedProduct.safetyStock} unit
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-6">
                <p className="text-sm text-orange-600">Reorder Point</p>
                <p className="text-2xl font-bold text-orange-700">
                  {selectedProduct.reorderPoint} unit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Calculation Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                Langkah Perhitungan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Hitung Safety Stock</p>
                    <div className="mt-2 font-mono text-sm bg-white p-3 rounded border">
                      <p>SS = (D<sub>max</sub> - D<sub>avg</sub>) × LT</p>
                      <p className="mt-1">
                        SS = ({Math.max(...selectedProduct.salesHistory.map(s => s.quantity))} - {selectedProduct.wmaForecast.toFixed(1)}) × {(selectedProduct.leadTime / 7).toFixed(1)}
                      </p>
                      <p className="mt-1 text-purple-700 font-bold">
                        SS = {selectedProduct.safetyStock} unit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Hitung Reorder Point</p>
                    <div className="mt-2 font-mono text-sm bg-white p-3 rounded border">
                      <p>ROP = (D<sub>avg</sub> × LT) + SS</p>
                      <p className="mt-1">
                        ROP = ({selectedProduct.wmaForecast.toFixed(1)} × {(selectedProduct.leadTime / 7).toFixed(1)}) + {selectedProduct.safetyStock}
                      </p>
                      <p className="mt-1 text-orange-700 font-bold">
                        ROP = {selectedProduct.reorderPoint} unit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">Kesimpulan</p>
                    <p className="text-green-700 mt-1">
                      Ketika stok <strong>{selectedProduct.name}</strong> mencapai 
                      <strong> {selectedProduct.reorderPoint} unit</strong>, sistem akan memberikan 
                      notifikasi untuk melakukan pemesanan kembali.
                    </p>
                    {selectedProduct.currentStock <= selectedProduct.reorderPoint && (
                      <div className="mt-3 p-3 bg-red-100 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700 font-semibold">
                          PERINGATAN: Stok saat ini ({selectedProduct.currentStock} unit) sudah mencapai ROP!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* All Products Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Perbandingan Stok vs ROP Semua Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <ReferenceLine x={0} stroke="#000" />
                <Bar dataKey="stock" name="Stok Saat Ini" fill="#3b82f6" />
                <Bar dataKey="rop" name="Reorder Point" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ringkasan Safety Stock & ROP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4">SKU</th>
                  <th className="text-left py-3 px-4">Nama Produk</th>
                  <th className="text-center py-3 px-4">Stok</th>
                  <th className="text-center py-3 px-4">Safety Stock</th>
                  <th className="text-center py-3 px-4">ROP</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {productsWithMetrics.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{product.sku}</td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={product.currentStock <= product.reorderPoint ? 'text-red-600 font-bold' : ''}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-purple-600 font-medium">
                      {product.safetyStock}
                    </td>
                    <td className="py-3 px-4 text-center text-orange-600 font-medium">
                      {product.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        className={
                          product.status === 'safe' ? 'bg-green-100 text-green-700' :
                          product.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }
                      >
                        {product.status === 'safe' ? 'Aman' :
                         product.status === 'warning' ? 'Peringatan' : 'Kritis'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
