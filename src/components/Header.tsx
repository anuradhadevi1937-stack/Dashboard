import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  Wallet, 
  LayoutDashboard, 
  ChevronDown,
  Clock
} from 'lucide-react';
import { DatePreset, DateRange } from '../types/database';

interface HeaderProps {
  dateRange: DateRange;
  onDateRangeChange: (newRange: DateRange) => void;
  onExportCSV: () => void;
  onOpenWalletModal: () => void;
  filteredOrdersCount: number;
  databaseMaxDate: string;
}

export const Header: React.FC<HeaderProps> = ({
  dateRange,
  onDateRangeChange,
  onExportCSV,
  onOpenWalletModal,
  filteredOrdersCount,
  databaseMaxDate,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'today', label: "Today (31 May)" },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month (May)' },
    { id: 'prev_month', label: 'Prev Month (Apr)' },
  ];

  const handlePresetClick = (preset: DatePreset) => {
    setIsCustomOpen(false);
    onDateRangeChange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      preset,
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      alert('Start date cannot be after end date.');
      return;
    }
    onDateRangeChange({
      startDate: customStart,
      endDate: customEnd,
      preset: 'custom',
    });
    setIsCustomOpen(false);
  };

  return (
    <header className="bg-slate-950/85 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-20 gap-4 flex-wrap md:flex-nowrap">
          {/* Left: VOYX Brand Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-teal-500/25 tracking-tighter">
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white">VOYX</span>
                  <span className="bg-teal-950/80 text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider">
                    Admin Pro
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-live-pulse" />
                  <span>Live Supabase Connected</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">DB: 2,831 Orders</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button 
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm transition-all"
              >
                <LayoutDashboard size={14} className="text-teal-400" />
                Sales Dashboard
              </button>
              <button 
                onClick={onOpenWalletModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <Wallet size={14} />
                Wallet Summary
              </button>
            </nav>
          </div>

          {/* Right: Actions (CSV Download, User, Logout) */}
          <div className="flex items-center gap-3">
            {/* Download CSV Button */}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title={`Download CSV for currently filtered ${filteredOrdersCount} orders`}
            >
              <Download size={15} />
              <span>Export CSV ({filteredOrdersCount})</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-300 border border-slate-700 flex items-center justify-center font-bold text-xs shadow-inner">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">Anuradha</div>
                <div className="text-[10px] text-slate-400 font-semibold">Sales Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector & Presets Bar */}
        <div className="py-3 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Clock size={12} />
              Period:
            </span>

            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  dateRange.preset === preset.id
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20 ring-1 ring-teal-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}

            {/* Custom Range Button */}
            <div className="relative">
              <button
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  dateRange.preset === 'custom'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Calendar size={13} />
                <span>Custom Range</span>
                <ChevronDown size={12} className={isCustomOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {/* Custom Date Dropdown Modal */}
              {isCustomOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                    <Calendar size={14} className="text-teal-400" />
                    Select Custom Date Interval
                  </h4>
                  <form onSubmit={handleApplyCustom} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">From Date:</label>
                      <input 
                        type="date"
                        value={customStart}
                        min="2026-01-01"
                        max={databaseMaxDate}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-teal-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">To Date:</label>
                      <input 
                        type="date"
                        value={customEnd}
                        min="2026-01-01"
                        max={databaseMaxDate}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCustomOpen(false)}
                        className="w-1/2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
                      >
                        Apply Range
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Active Date Display Pill */}
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono font-semibold">
            <Calendar size={13} className="text-teal-400" />
            <span>
              {dateRange.startDate} {dateRange.startDate !== dateRange.endDate ? `to ${dateRange.endDate}` : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
