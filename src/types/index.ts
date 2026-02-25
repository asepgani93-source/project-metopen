// Types for Fashionable Inventory System

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'kemeja' | 'celana' | 'gamis';
  price: number;
  currentStock: number;
  leadTime: number; // in days
  createdAt: Date;
}

export interface SalesTransaction {
  id: string;
  productId: string;
  quantity: number;
  date: Date;
  unitPrice: number;
}

export interface WMAForecast {
  productId: string;
  period: Date;
  forecastValue: number;
  actualValue?: number;
  weights: number[]; // default [1, 2, 3]
}

export interface SafetyStock {
  productId: string;
  dMax: number; // permintaan maksimum
  dAvg: number; // permintaan rata-rata
  leadTime: number;
  ssValue: number;
  calculatedAt: Date;
}

export interface ReorderPoint {
  productId: string;
  ropValue: number;
  dAvg: number;
  leadTime: number;
  safetyStock: number;
  calculatedAt: Date;
}

export interface ProductWithMetrics extends Product {
  salesHistory: SalesTransaction[];
  wmaForecast: number;
  safetyStock: number;
  reorderPoint: number;
  mape?: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface DashboardStats {
  totalProducts: number;
  totalSKUs: number;
  lowStockCount: number;
  criticalStockCount: number;
  totalTransactions: number;
  averageMAPE: number;
}
