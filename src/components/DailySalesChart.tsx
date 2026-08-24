import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyChartPoint } from '../types/database';
import { TrendingUp } from 'lucide-react';

interface DailySalesChartProps {
  data: DailyChartPoint[];
  periodLabel: string;
}

export const DailySalesChart: React.FC<DailySalesChartProps> = ({ data, periodLabel }) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'orders' | 'combined'>('combined');

  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  const totalPeriodRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPeriodOrders = data.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="navy-card p-6 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Daily Sales & Revenue Trend
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic performance over {periodLabel} ({data.length} {data.length === 1 ? 'day' : 'days'})
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'combined' ? 'bg-teal-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'revenue' ? 'bg-teal-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Revenue (₹)
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'orders' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No daily data points available for the selected interval.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              
              <XAxis 
                dataKey="formattedDate" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />

              <YAxis 
                yAxisId="left"
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                tickFormatter={formatINR}
                hide={viewMode === 'orders'}
              />

              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                hide={viewMode === 'revenue'}
              />

              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rev = payload.find(p => p.dataKey === 'revenue')?.value as number || 0;
                    const ords = payload.find(p => p.dataKey === 'orders')?.value as number || 0;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</div>
                        <div className="flex items-center justify-between gap-4 text-teal-400 font-bold">
                          <span>Revenue:</span>
                          <span className="font-mono">₹{rev.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-cyan-400 font-semibold">
                          <span>Orders:</span>
                          <span className="font-mono">{ords} orders</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {(viewMode === 'revenue' || viewMode === 'combined') && (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue (₹)"
                  stroke="#2DD4BF" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              )}

              {(viewMode === 'orders' || viewMode === 'combined') && (
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  name="Orders"
                  stroke="#22D3EE" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Period Total Revenue</span>
          <span className="text-base font-extrabold text-white font-numeric">
            ₹{totalPeriodRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Period Total Orders</span>
          <span className="text-base font-extrabold text-cyan-400 font-numeric">
            {totalPeriodOrders.toLocaleString()} orders
          </span>
        </div>
      </div>
    </div>
  );
};
