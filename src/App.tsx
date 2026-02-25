import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Shield, 
  Bell,
  Menu,
  X,
  LogOut,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';

// Import Semua Halaman (Pages)
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Sales from '@/pages/Sales';
import WMAForecast from '@/pages/WMAForecast';
import SafetyStockROP from '@/pages/SafetyStockROP';
import Notifications from '@/pages/Notifications';

type Page = 'dashboard' | 'products' | 'sales' | 'wma' | 'safety-stock' | 'notifications';

const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products' as Page, label: 'Produk', icon: Package },
  { id: 'sales' as Page, label: 'Penjualan', icon: ShoppingCart },
  { id: 'wma' as Page, label: 'Prediksi WMA', icon: TrendingUp },
  { id: 'safety-stock' as Page, label: 'Safety Stock & ROP', icon: Shield },
  { id: 'notifications' as Page, label: 'Notifikasi', icon: Bell },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mengambil data dari custom hook
  const inventory = useInventory();
  
  // Menghitung jumlah notifikasi dinamis berdasarkan produk dengan stok rendah/kritis
  const notificationCount = inventory.lowStockProducts?.length || 0;

  // Fungsi untuk me-render halaman yang aktif
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard inventory={inventory} />; // Memanggil file Dashboard.tsx yang baru!
      case 'products':
        return <Products inventory={inventory} />;
      case 'sales':
        return <Sales inventory={inventory} />;
      case 'wma':
        return <WMAForecast inventory={inventory} />;
      case 'safety-stock':
        return <SafetyStockROP inventory={inventory} />;
      case 'notifications':
        return <Notifications inventory={inventory} />;
      default:
        return <Dashboard inventory={inventory} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Toaster />
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden flex-shrink-0 z-20 relative`}
      >
        {/* Logo Toko Fashionable */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg truncate">Fashionable</h1>
              <p className="text-xs text-slate-400 truncate tracking-wide">Inventory System</p>
            </div>
          </div>
        </div>
        
        {/* Navigasi Menu */}
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isNotifications = item.id === 'notifications';
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {isNotifications && notificationCount > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white ml-auto border-none">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
        
        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Keluar</span>
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header Atas */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {menuItems.find(m => m.id === currentPage)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Ikon Lonceng Notifikasi */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-slate-100 text-slate-500"
                onClick={() => setCurrentPage('notifications')}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute 0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm transform translate-x-1/4 -translate-y-1/4">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Profil User */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Admin</p>
                <p className="text-xs font-medium text-slate-500">Toko Fashionable</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Konten Halaman yang Bisa Di-scroll */}
        <ScrollArea className="flex-1 w-full h-full bg-slate-50">
          <div className="p-4 md:p-6 pb-24 min-h-full">
            {/* Ini akan memanggil Dashboard.tsx atau WMAForecast.tsx sesuai state */}
            {renderPage()}
          </div>
        </ScrollArea>
        
      </main>
    </div>
  );
}