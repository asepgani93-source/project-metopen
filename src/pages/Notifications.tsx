import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Package, 
  ShoppingCart,
  TrendingDown,
  Shield
} from 'lucide-react';
import type { useInventory } from '@/hooks/useInventory';

interface NotificationsProps {
  inventory: ReturnType<typeof useInventory>;
}

export default function Notifications({ inventory }: NotificationsProps) {
  const { productsWithMetrics } = inventory;

  const criticalProducts = productsWithMetrics.filter(p => p.status === 'critical');
  const warningProducts = productsWithMetrics.filter(p => p.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Stok Kritis</p>
                <p className="text-3xl font-bold text-red-700">{criticalProducts.length}</p>
                <p className="text-xs text-red-500">Produk perlu restock segera</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Peringatan Stok</p>
                <p className="text-3xl font-bold text-yellow-700">{warningProducts.length}</p>
                <p className="text-xs text-yellow-500">Produk mendekati ROP</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Stok Aman</p>
                <p className="text-3xl font-bold text-green-700">
                  {productsWithMetrics.filter(p => p.status === 'safe').length}
                </p>
                <p className="text-xs text-green-500">Produk dalam kondisi baik</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Stock Alerts */}
      {criticalProducts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ALERT: Stok Kritis - Perlu Restock Segera!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalProducts.map(product => (
                <div key={product.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">{product.name}</p>
                        <p className="text-sm text-red-600">SKU: {product.sku}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm">
                            Stok: <strong className="text-red-700">{product.currentStock} unit</strong>
                          </span>
                          <span className="text-sm">
                            ROP: <strong>{product.reorderPoint} unit</strong>
                          </span>
                          <span className="text-sm">
                            Safety Stock: <strong className="text-purple-600">{product.safetyStock} unit</strong>
                          </span>
                        </div>
                        <p className="text-sm text-red-600 mt-2">
                          Stok sudah mencapai atau di bawah Reorder Point. Segera lakukan pemesanan!
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-600 text-white">KRITIS</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Buat PO
                    </Button>
                    <Button size="sm" variant="outline">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Stock Alerts */}
      {warningProducts.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-lg text-yellow-700 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Peringatan: Stok Mendekati ROP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warningProducts.map(product => (
                <div key={product.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800">{product.name}</p>
                        <p className="text-sm text-yellow-600">SKU: {product.sku}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm">
                            Stok: <strong className="text-yellow-700">{product.currentStock} unit</strong>
                          </span>
                          <span className="text-sm">
                            ROP: <strong>{product.reorderPoint} unit</strong>
                          </span>
                          <span className="text-sm">
                            Prediksi WMA: <strong className="text-blue-600">{product.wmaForecast.toFixed(1)} unit/minggu</strong>
                          </span>
                        </div>
                        <p className="text-sm text-yellow-600 mt-2">
                          Stok mendekati Reorder Point. Pertimbangkan untuk melakukan pemesanan dalam waktu dekat.
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500 text-white">PERINGATAN</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Products Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Ringkasan Status Semua Produk
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
                  <th className="text-center py-3 px-4">ROP</th>
                  <th className="text-center py-3 px-4">Prediksi WMA</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {productsWithMetrics.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{product.sku}</td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={
                        product.status === 'critical' ? 'text-red-600 font-bold' :
                        product.status === 'warning' ? 'text-yellow-600 font-bold' :
                        ''
                      }>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{product.reorderPoint}</td>
                    <td className="py-3 px-4 text-center">{product.wmaForecast.toFixed(1)}</td>
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
                    <td className="py-3 px-4 text-center">
                      {product.status !== 'safe' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Order
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {criticalProducts.length === 0 && warningProducts.length === 0 && (
        <Card className="border-green-200">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Semua Stok dalam Kondisi Aman!
            </h3>
            <p className="text-green-600">
              Tidak ada produk yang perlu di-restock saat ini. Semua stok berada di atas Reorder Point.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
