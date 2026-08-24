import React from 'react';
import { Globe, Compass } from 'lucide-react';
import { DestinationMetric } from '../types/database';

interface TopDestinationsProps {
  destinations: DestinationMetric[];
  periodLabel: string;
}

export const TopDestinations: React.FC<TopDestinationsProps> = ({
  destinations,
  periodLabel,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="navy-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Top Travel Destinations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown by order volume and revenue ({periodLabel})
            </p>
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-3.5">
        {destinations.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No destination sales recorded in the selected date range.
          </div>
        ) : (
          destinations.map((dest, idx) => (
            <div 
              key={dest.destinationId}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  {/* Flag Icon */}
                  <img 
                    src={dest.flagPath} 
                    alt={dest.destinationName}
                    className="w-5 h-3.5 object-cover rounded shadow-sm"
                    onError={(e) => {
                      // Fallback icon if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <span className="font-bold text-white text-xs block leading-tight">
                      {dest.destinationName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {dest.destinationId} • {dest.destinationType === 2 ? 'Regional Pack' : 'Country eSIM'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-xs block leading-tight">
                    {formatINR(dest.revenue)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {dest.orderCount} {dest.orderCount === 1 ? 'order' : 'orders'} ({dest.sharePct}%)
                  </span>
                </div>
              </div>

              {/* Progress Share Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    idx === 0 
                      ? 'bg-gradient-to-r from-voyx-orange to-amber-400' 
                      : idx === 1
                      ? 'bg-gradient-to-r from-cyan-400 to-indigo-400'
                      : 'bg-indigo-500/80'
                  }`}
                  style={{ width: `${Math.min(Math.max(dest.sharePct, 4), 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Notes on Aggregation */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1.5">
        <Compass size={12} className="text-voyx-orange flex-shrink-0" />
        <span>Mapped via product coverage codes to ISO-3 country registry</span>
      </div>
    </div>
  );
};
