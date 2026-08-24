import React from 'react';
import { 
  Trophy, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award
} from 'lucide-react';
import { SalespersonRow } from '../types/database';

interface SalesLeaderboardProps {
  leaderboard: SalespersonRow[];
  periodLabel: string;
}

export const SalesLeaderboard: React.FC<SalesLeaderboardProps> = ({
  leaderboard,
  periodLabel,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-400/20">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-slate-300/20">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-700/20">
          🥉
        </div>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[11px] font-mono">
        #{rank}
      </span>
    );
  };

  return (
    <div className="navy-card p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-voyx-orange flex items-center justify-center">
            <Trophy size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Sales Team Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by net revenue for {periodLabel} with Month-to-Date (MTD) tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-voyx-orange" />
          <span>Active Reps: {leaderboard.filter(r => r.periodOrders > 0).length} of {leaderboard.length}</span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-4">Salesperson</th>
              <th className="py-3 px-4 text-center">Period Orders</th>
              <th className="py-3 px-4 text-right">Period Revenue</th>
              <th className="py-3 px-4 text-center">MTD Orders</th>
              <th className="py-3 px-4 text-right">MTD Revenue</th>
              <th className="py-3 px-4 text-right">ARPU / AOV</th>
              <th className="py-3 px-4 text-center">Growth</th>
              <th className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1">
                  Target
                  <span title="No target field exists in Supabase schema" className="cursor-help text-slate-500">ℹ️</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leaderboard.map((rep) => {
              const isPositive = rep.growthPct >= 0;
              const hasSales = rep.periodOrders > 0;

              return (
                <tr 
                  key={rep.userId}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    rep.rank <= 3 ? 'bg-slate-900/30' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getRankBadge(rep.rank)}
                  </td>

                  {/* Salesperson info */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                        rep.rank === 1 
                          ? 'bg-gradient-to-tr from-voyx-orange to-amber-500 text-white' 
                          : rep.rank === 2
                          ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {rep.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{rep.name}</span>
                          {rep.rank === 1 && <Award size={13} className="text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: #{rep.userId} • {rep.mobile ? `+91 ${rep.mobile}` : 'Sales Team'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Period Orders */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                      hasSales ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
                    }`}>
                      {rep.periodOrders}
                    </span>
                  </td>

                  {/* Period Revenue */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className={`font-mono font-extrabold text-xs ${
                      hasSales ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {formatINR(rep.periodRevenue)}
                    </span>
                  </td>

                  {/* MTD Orders */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-semibold text-slate-300">
                    {rep.mtdOrders}
                  </td>

                  {/* MTD Revenue */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-200">
                    {formatINR(rep.mtdRevenue)}
                  </td>

                  {/* ARPU / AOV */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-300">
                    {hasSales ? formatINR(rep.arpu) : '-'}
                  </td>

                  {/* Growth */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {hasSales && rep.prevRevenue > 0 ? (
                      <span className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(rep.growthPct)}%
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Target Column (Explicitly N/A per prompt rule) */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800" title="No target column exists in database schema">
                      N/A
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
