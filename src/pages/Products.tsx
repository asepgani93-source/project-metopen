import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import type { useInventory } from '@/hooks/useInventory';
import type { Product } from '@/types';
import { toast } from 'sonner';

interface ProductsProps {
  inventory: ReturnType<typeof useInventory>;
}

export default function Products({ inventory }: ProductsProps) {
  const { productsWithMetrics, addProduct, updateProduct, deleteProduct } = inventory;
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'kemeja' as Product['category'],
    price: '',
    currentStock: '',
    leadTime: '7',
  });

  const filteredProducts = productsWithMetrics.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.sku || !formData.name || !formData.price || !formData.currentStock) {
      toast.error('Semua field harus diisi');
      return;
    }

    addProduct({
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      currentStock: Number(formData.currentStock),
      leadTime: Number(formData.leadTime),
    });

    toast.success('Produk berhasil ditambahkan');
    setFormData({
      sku: '',
      name: '',
      category: 'kemeja',
      price: '',
      currentStock: '',
      leadTime: '7',
    });
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    
    updateProduct(editingProduct.id, editingProduct);
    toast.success('Produk berhasil diupdate');
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
      toast.success('Produk berhasil dihapus');
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'kemeja':
        return <Badge className="bg-blue-100 text-blue-700">Kemeja</Badge>;
      case 'celana':
        return <Badge className="bg-green-100 text-green-700">Celana</Badge>;
      case 'gamis':
        return <Badge className="bg-purple-100 text-purple-700">Gamis</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return <Badge className="bg-green-100 text-green-700">Aman</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">Peringatan</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Kritis</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>SKU</Label>
                <Input
                  placeholder="Contoh: KEM-003"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <Label>Nama Produk</Label>
                <Input
                  placeholder="Nama produk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as Product['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kemeja">Kemeja</SelectItem>
                    <SelectItem value="celana">Celana</SelectItem>
                    <SelectItem value="gamis">Gamis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Harga (Rp)</Label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Stok Awal</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                />
              </div>
              <div>
                <Label>Lead Time (hari)</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleSubmit}>Simpan</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Daftar Produk ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Kategori</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Harga</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Stok</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">ROP</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{product.sku}</td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-center">{getCategoryBadge(product.category)}</td>
                    <td className="py-3 px-4 text-right">
                      Rp {product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={product.status === 'critical' ? 'text-red-600 font-bold' : ''}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {product.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingProduct({ ...product })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Produk</DialogTitle>
                            </DialogHeader>
                            {editingProduct && (
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>SKU</Label>
                                  <Input
                                    value={editingProduct.sku}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Nama Produk</Label>
                                  <Input
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Harga (Rp)</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label>Stok</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct.currentStock}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: Number(e.target.value) })}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={handleUpdate}>Update</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
