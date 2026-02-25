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
import { TrendingUp, Calculator, Info } from 'lucide-react';
import type { useInventory } from '@/hooks/useInventory';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface WMAForecastProps {
  inventory: ReturnType<typeof useInventory>;
}

export default function WMAForecast({ inventory }: WMAForecastProps) {
  const { productsWithMetrics, getSalesHistory } = inventory;
  const [selectedProductId, setSelectedProductId] = useState(productsWithMetrics[0]?.id || '');
  
  const selectedProduct = productsWithMetrics.find(p => p.id === selectedProductId);
  const salesHistory = selectedProductId ? getSalesHistory(selectedProductId) : [];

  // Group sales by week for chart
  const getWeeklyData = () => {
    const grouped: Record<string, { week: string; actual: number; forecast?: number }> = {};
    
    salesHistory.forEach(sale => {
      const date = new Date(sale.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = { week: weekKey, actual: 0 };
      }
      grouped[weekKey].actual += sale.quantity;
    });

    // Calculate WMA forecast for each week
    const weeks = Object.keys(grouped).sort();
    const result = weeks.map((week, index) => {
      const prevWeeks = weeks.slice(0, index).map(w => grouped[w].actual);
      const forecast = prevWeeks.length >= 3 ? calculateWMA(prevWeeks) : undefined;
      
      return {
        week: new Date(week).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        actual: grouped[week].actual,
        forecast,
      };
    });

    return result;
  };

  const calculateWMA = (data: number[]): number => {
    if (data.length < 3) return data[data.length - 1] || 0;
    const weights = [1, 2, 3];
    const recent3 = data.slice(-3);
    const weightedSum = recent3.reduce((sum, val, idx) => sum + val * weights[idx], 0);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    return Math.round((weightedSum / weightSum) * 100) / 100;
  };

  const chartData = getWeeklyData();

  // Get MAPE category
  const getMAPECategory = (mape?: number) => {
    if (mape === undefined) return { label: 'N/A', color: 'bg-gray-100 text-gray-700' };
    if (mape < 10) return { label: 'Sangat Baik', color: 'bg-green-100 text-green-700' };
    if (mape < 20) return { label: 'Baik', color: 'bg-blue-100 text-blue-700' };
    if (mape < 50) return { label: 'Layak', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Buruk', color: 'bg-red-100 text-red-700' };
  };

  const mapeCategory = getMAPECategory(selectedProduct?.mape);

  return (
    <div className="space-y-6">
      {/* Header with Product Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Prediksi Weighted Moving Average</h2>
          <p className="text-sm text-slate-500">Perhitungan WMA dengan bobot [1, 2, 3]</p>
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Rumus WMA dengan Bobot [1, 2, 3]</p>
              <div className="mt-2 p-3 bg-white rounded-lg font-mono text-sm">
                WMA = (D₁ × 1 + D₂ × 2 + D₃ × 3) / (1 + 2 + 3)
              </div>
              <p className="text-sm text-blue-600 mt-2">
                D₁ = periode tertua (17%) | D₂ = periode tengah (33%) | D₃ = periode terbaru (50%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Prediksi WMA (Minggu Depan)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {selectedProduct.wmaForecast.toFixed(1)} unit
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">MAPE (Akurasi)</p>
                <p className="text-3xl font-bold text-purple-600">
                  {selectedProduct.mape?.toFixed(2) || 'N/A'}%
                </p>
                {selectedProduct.mape && (
                  <Badge className={mapeCategory.color}>{mapeCategory.label}</Badge>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Stok Saat Ini</p>
                <p className={`text-3xl font-bold ${
                  selectedProduct.currentStock <= selectedProduct.reorderPoint 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {selectedProduct.currentStock} unit
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Reorder Point</p>
                <p className="text-3xl font-bold text-orange-600">
                  {selectedProduct.reorderPoint} unit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Grafik Prediksi WMA vs Aktual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine 
                      y={selectedProduct.reorderPoint} 
                      label="ROP" 
                      stroke="red" 
                      strokeDasharray="3 3" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Aktual" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      name="Prediksi WMA" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Detail Perhitungan WMA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-4">Minggu</th>
                      <th className="text-center py-3 px-4">Penjualan Aktual</th>
                      <th className="text-center py-3 px-4">Bobot</th>
                      <th className="text-center py-3 px-4">Weighted Value</th>
                      <th className="text-center py-3 px-4">Prediksi WMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, index) => {
                      const prevRows = chartData.slice(0, index);
                      const hasForecast = prevRows.length >= 3;
                      
                      return (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{row.week}</td>
                          <td className="py-3 px-4 text-center font-medium">
                            {row.actual} unit
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500">
                            {hasForecast ? '1, 2, 3' : '-'}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500">
                            {hasForecast ? (
                              (() => {
                                const prev3 = chartData.slice(index - 3, index).map(r => r.actual);
                                const w1 = prev3[0] * 1;
                                const w2 = prev3[1] * 2;
                                const w3 = prev3[2] * 3;
                                return `${w1} + ${w2} + ${w3} = ${w1 + w2 + w3}`;
                              })()
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.forecast !== undefined ? (
                              <Badge className="bg-green-100 text-green-700">
                                {row.forecast.toFixed(1)} unit
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
