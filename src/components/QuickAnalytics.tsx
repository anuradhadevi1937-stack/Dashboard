import React from 'react';
import { 
  Package, 
  User, 
  Smartphone, 
  Database
} from 'lucide-react';
import { QuickAnalyticsData } from '../types/database';

interface QuickAnalyticsProps {
  data: QuickAnalyticsData;
  periodLabel: string;
}

export const QuickAnalytics: React.FC<QuickAnalyticsProps> = ({ data, periodLabel }) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalSimOrders = data.simModeDistribution.esimCount + data.simModeDistribution.plasticCount;
  const esimPct = totalSimOrders > 0 ? Math.round((data.simModeDistribution.esimCount / totalSimOrders) * 100) : 0;
  const plasticPct = 100 - esimPct;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Best-Selling Product */}
      <div className="navy-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-voyx-orange flex items-center justify-center">
            <Package size={15} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Top Product ({periodLabel})
          </span>
        </div>

        {data.topProduct ? (
          <div>
            <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1" title={data.topProduct.name}>
              {data.topProduct.name}
            </h4>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono font-extrabold text-base text-voyx-orange">
                {formatINR(data.topProduct.revenue)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({data.topProduct.orders} orders)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-3">No product data for selected period</div>
        )}
      </div>

      {/* 2. Top Customer */}
      <div className="navy-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <User size={15} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Top Customer ({periodLabel})
          </span>
        </div>

        {data.topCustomer ? (
          <div>
            <h4 className="text-sm font-bold text-white truncate mb-1">
              {data.topCustomer.name}
            </h4>
            <div className="text-[10px] text-slate-500 font-mono">
              +{data.topCustomer.mobile || 'Customer ID: #' + data.topCustomer.id}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono font-extrabold text-base text-emerald-400">
                {formatINR(data.topCustomer.revenue)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({data.topCustomer.orders} orders)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-3">No customer sales recorded</div>
        )}
      </div>

      {/* 3. SIM Mode Distribution (eSIM vs Plastic SIM) */}
      <div className="navy-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Smartphone size={15} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            SIM Type Ratio
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">eSIM: {data.simModeDistribution.esimCount} ({esimPct}%)</span>
            <span className="text-slate-400">Plastic: {data.simModeDistribution.plasticCount} ({plasticPct}%)</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-voyx-orange h-full" 
              style={{ width: `${esimPct}%` }} 
              title={`eSIM: ${esimPct}%`}
            />
            <div 
              className="bg-cyan-500 h-full" 
              style={{ width: `${plasticPct}%` }} 
              title={`Plastic: ${plasticPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>eSIM: {formatINR(data.simModeDistribution.esimRevenue)}</span>
            <span>Plastic: {formatINR(data.simModeDistribution.plasticRevenue)}</span>
          </div>
        </div>
      </div>

      {/* 4. Lifetime Database Overview */}
      <div className="navy-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Database size={15} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Supabase Registry
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Users</span>
            <span className="font-mono font-bold text-white text-xs mt-0.5 block">2,587</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Orders</span>
            <span className="font-mono font-bold text-voyx-orange text-xs mt-0.5 block">2,831</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Sales Team</span>
            <span className="font-mono font-bold text-cyan-400 text-xs mt-0.5 block">14 Reps</span>
          </div>
        </div>
      </div>
    </div>
  );
};
