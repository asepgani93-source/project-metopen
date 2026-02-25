import { useState, useCallback, useMemo } from 'react';
import type { 
  Product, 
  SalesTransaction, 
  ProductWithMetrics, 
  DashboardStats 
} from '@/types';

// Helper: Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper: Get week key from date
const getWeekKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Helper: Group sales by week
const groupSalesByWeek = (sales: SalesTransaction[]) => {
  const grouped: Record<string, number> = {};
  sales.forEach(sale => {
    const weekKey = getWeekKey(sale.date);
    grouped[weekKey] = (grouped[weekKey] || 0) + sale.quantity;
  });
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([, qty]) => qty);
};

// WMA Calculation with weights [1, 2, 3]
const calculateWMA = (weeklySales: number[]): number => {
  if (weeklySales.length < 3) return weeklySales[weeklySales.length - 1] || 0;
  
  const weights = [1, 2, 3];
  const recent3 = weeklySales.slice(-3);
  const weightedSum = recent3.reduce((sum, val, idx) => sum + val * weights[idx], 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  
  return Math.round((weightedSum / weightSum) * 100) / 100;
};

// Safety Stock Calculation: SS = (Dmax - Davg) × LT
const calculateSafetyStock = (
  weeklySales: number[], 
  leadTime: number
): number => {
  if (weeklySales.length === 0) return 0;
  
  const dMax = Math.max(...weeklySales);
  const dAvg = weeklySales.reduce((a, b) => a + b, 0) / weeklySales.length;
  const ss = (dMax - dAvg) * leadTime;
  
  return Math.ceil(ss);
};

// Reorder Point Calculation: ROP = (Davg × LT) + SS
const calculateROP = (
  weeklySales: number[], 
  leadTime: number, 
  safetyStock: number
): number => {
  if (weeklySales.length === 0) return safetyStock;
  
  const dAvg = weeklySales.reduce((a, b) => a + b, 0) / weeklySales.length;
  const rop = (dAvg * leadTime) + safetyStock;
  
  return Math.ceil(rop);
};

// MAPE Calculation
const calculateMAPE = (actual: number[], forecast: number[]): number => {
  if (actual.length === 0 || forecast.length === 0) return 0;
  
  let totalError = 0;
  let count = 0;
  
  for (let i = 0; i < Math.min(actual.length, forecast.length); i++) {
    if (actual[i] > 0) {
      totalError += Math.abs((actual[i] - forecast[i]) / actual[i]);
      count++;
    }
  }
  
  return count > 0 ? Math.round((totalError / count) * 10000) / 100 : 0;
};

// Initial sample data
const initialProducts: Product[] = [
  { id: '1', sku: 'KEM-001', name: 'Kemeja Putih M', category: 'kemeja', price: 150000, currentStock: 35, leadTime: 7, createdAt: new Date('2025-08-01') },
  { id: '2', sku: 'KEM-002', name: 'Kemeja Biru L', category: 'kemeja', price: 160000, currentStock: 28, leadTime: 7, createdAt: new Date('2025-08-01') },
  { id: '3', sku: 'CEL-001', name: 'Celana Panjang Hitam L', category: 'celana', price: 200000, currentStock: 42, leadTime: 7, createdAt: new Date('2025-08-01') },
  { id: '4', sku: 'CEL-002', name: 'Celana Pendek Putih M', category: 'celana', price: 120000, currentStock: 18, leadTime: 7, createdAt: new Date('2025-08-01') },
  { id: '5', sku: 'GAM-001', name: 'Gamis Batik M', category: 'gamis', price: 250000, currentStock: 22, leadTime: 7, createdAt: new Date('2025-08-01') },
  { id: '6', sku: 'GAM-002', name: 'Gamis Polos L', category: 'gamis', price: 220000, currentStock: 15, leadTime: 7, createdAt: new Date('2025-08-01') },
];

// Generate sample sales data (6 months)
const generateSampleSales = (): SalesTransaction[] => {
  const sales: SalesTransaction[] = [];
  const startDate = new Date('2025-08-01');
  
  initialProducts.forEach(product => {
    // Generate weekly sales for 6 months (~24 weeks)
    for (let week = 0; week < 24; week++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + week * 7 + Math.floor(Math.random() * 5));
      
      // Random quantity with some pattern
      let baseQty = 15;
      if (product.category === 'kemeja') baseQty = 18;
      if (product.category === 'gamis') baseQty = 12;
      
      const qty = Math.max(5, Math.floor(baseQty + (Math.random() - 0.5) * 10));
      
      sales.push({
        id: generateId(),
        productId: product.id,
        quantity: qty,
        date,
        unitPrice: product.price,
      });
    }
  });
  
  return sales;
};

export function useInventory() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<SalesTransaction[]>(generateSampleSales());

  // Add new product
  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  // Update product
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Delete product
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setSales(prev => prev.filter(s => s.productId !== id));
  }, []);

  // Add sales transaction
  const addSale = useCallback((sale: Omit<SalesTransaction, 'id'>) => {
    const newSale: SalesTransaction = {
      ...sale,
      id: generateId(),
    };
    setSales(prev => [...prev, newSale]);
    
    // Update current stock
    setProducts(prev => prev.map(p => {
      if (p.id === sale.productId) {
        return { ...p, currentStock: Math.max(0, p.currentStock - sale.quantity) };
      }
      return p;
    }));
    
    return newSale;
  }, []);

  // Get sales history for a product
  const getSalesHistory = useCallback((productId: string): SalesTransaction[] => {
    return sales
      .filter(s => s.productId === productId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [sales]);

  // Calculate metrics for a product
  const getProductMetrics = useCallback((product: Product): ProductWithMetrics => {
    const productSales = sales.filter(s => s.productId === product.id);
    const weeklySales = groupSalesByWeek(productSales);
    
    const wmaForecast = calculateWMA(weeklySales);
    const safetyStock = calculateSafetyStock(weeklySales, product.leadTime / 7);
    const reorderPoint = calculateROP(weeklySales, product.leadTime / 7, safetyStock);
    
    // Calculate MAPE if we have enough data
    let mape: number | undefined;
    if (weeklySales.length >= 4) {
      const actual = weeklySales.slice(3);
      const forecast: number[] = [];
      for (let i = 3; i < weeklySales.length; i++) {
        const prev3 = weeklySales.slice(i - 3, i);
        forecast.push(calculateWMA(prev3));
      }
      mape = calculateMAPE(actual, forecast);
    }
    
    // Determine status
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (product.currentStock <= reorderPoint) {
      status = 'critical';
    } else if (product.currentStock <= reorderPoint + safetyStock) {
      status = 'warning';
    }
    
    return {
      ...product,
      salesHistory: productSales,
      wmaForecast,
      safetyStock,
      reorderPoint,
      mape,
      status,
    };
  }, [sales]);

  // Get all products with metrics
  const productsWithMetrics = useMemo(() => {
    return products.map(getProductMetrics);
  }, [products, getProductMetrics]);

  // Dashboard stats
  const dashboardStats: DashboardStats = useMemo(() => {
    const metrics = productsWithMetrics;
    const mapeValues = metrics.map(m => m.mape).filter((m): m is number => m !== undefined);
    
    return {
      totalProducts: products.length,
      totalSKUs: products.length,
      lowStockCount: metrics.filter(m => m.status === 'warning').length,
      criticalStockCount: metrics.filter(m => m.status === 'critical').length,
      totalTransactions: sales.length,
      averageMAPE: mapeValues.length > 0 
        ? Math.round((mapeValues.reduce((a, b) => a + b, 0) / mapeValues.length) * 100) / 100
        : 0,
    };
  }, [productsWithMetrics, products.length, sales.length]);

  // Get low stock products
  const lowStockProducts = useMemo(() => {
    return productsWithMetrics.filter(p => p.status === 'critical' || p.status === 'warning');
  }, [productsWithMetrics]);

  // Get products by category
  const getProductsByCategory = useCallback((category: Product['category']) => {
    return productsWithMetrics.filter(p => p.category === category);
  }, [productsWithMetrics]);

  return {
    products,
    sales,
    productsWithMetrics,
    dashboardStats,
    lowStockProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    getSalesHistory,
    getProductMetrics,
    getProductsByCategory,
  };
}
