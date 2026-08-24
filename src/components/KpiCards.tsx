import React from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  History, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { KpiMetrics } from '../types/database';

interface KpiCardsProps {
  kpis: KpiMetrics;
  periodLabel: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, periodLabel }) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isRevPositive = kpis.revenueGrowthPct >= 0;
  const isOrdersPositive = kpis.ordersGrowthPct >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Selected Period Orders */}
      <div className="navy-card navy-card-hover p-6 relative overflow-hidden group border-teal-500/25">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Orders ({periodLabel})
          </span>
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center border border-teal-500/30 group-hover:scale-110 transition-transform">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-numeric tracking-tight">
            {kpis.selectedOrders.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">orders</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">vs prev period ({kpis.prevOrders})</span>
          <div className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
            isOrdersPositive 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {isOrdersPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{Math.abs(Math.round(kpis.ordersGrowthPct))}%</span>
          </div>
        </div>
      </div>

      {/* 2. Selected Period Revenue */}
      <div className="navy-card navy-card-hover p-6 relative overflow-hidden group border-teal-400/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Net Revenue ({periodLabel})
          </span>
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40 group-hover:scale-110 transition-transform">
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-numeric tracking-tight">
            {formatINR(kpis.selectedNetRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Gross: {formatINR(kpis.selectedGrossRevenue)} • Disc: {formatINR(kpis.selectedDiscounts)}</span>
          <div className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
            isRevPositive 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {isRevPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{isRevPositive ? '+' : ''}{Math.round(kpis.revenueGrowthPct)}%</span>
          </div>
        </div>
      </div>

      {/* 3. Previous Period Orders */}
      <div className="navy-card navy-card-hover p-6 relative overflow-hidden group border-cyan-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Previous Period Orders
          </span>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
            <History size={20} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-200 font-numeric tracking-tight">
            {kpis.prevOrders.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">orders</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Average Order Value (AOV)</span>
          <span className="font-mono font-bold text-slate-200">{formatINR(kpis.aov)}</span>
        </div>
      </div>

      {/* 4. Previous Period Revenue */}
      <div className="navy-card navy-card-hover p-6 relative overflow-hidden group border-emerald-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Previous Period Revenue
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <Receipt size={20} />
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-200 font-numeric tracking-tight">
            {formatINR(kpis.prevNetRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Previous Gross Revenue</span>
          <span className="font-mono font-bold text-slate-300">{formatINR(kpis.prevGrossRevenue)}</span>
        </div>
      </div>
    </div>
  );
};
