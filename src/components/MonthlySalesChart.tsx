import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { MonthlyChartPoint } from '../types/database';
import { CalendarRange } from 'lucide-react';

interface MonthlySalesChartProps {
  data: MonthlyChartPoint[];
}

export const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data }) => {
  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const totalHistoricalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="navy-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <CalendarRange size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Monthly Sales Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical revenue aggregated across all available months
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 block">Total Historical</span>
          <span className="text-sm font-extrabold text-indigo-400 font-numeric">
            ₹{totalHistoricalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            
            <XAxis 
              dataKey="formattedMonth" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />

            <YAxis 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              tickFormatter={formatINR}
            />

            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const rev = payload[0].value as number || 0;
                  const ords = payload[0].payload.orders as number || 0;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                      <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-indigo-400 font-bold">
                        <span>Net Revenue:</span>
                        <span className="font-mono">₹{rev.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-300 font-semibold">
                        <span>Volume:</span>
                        <span className="font-mono">{ords} orders</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="revenue" name="Monthly Revenue" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#FF6B00' : '#6366F1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Bar Values Breakdown */}
      <div className="grid grid-cols-5 gap-2 pt-4 mt-2 border-t border-slate-800/80 text-center">
        {data.map((m) => (
          <div key={m.month} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block truncate">{m.formattedMonth}</span>
            <span className="text-xs font-bold text-white font-numeric block mt-0.5">
              {formatINR(m.revenue)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {m.orders} ord
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
