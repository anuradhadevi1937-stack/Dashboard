import React from 'react';
import { 
  Filter, 
  Search, 
  UserCheck, 
  Smartphone, 
  RotateCcw,
  X
} from 'lucide-react';
import { DashboardFilters, User } from '../types/database';

interface FiltersProps {
  filters: DashboardFilters;
  onFilterChange: (newFilters: DashboardFilters) => void;
  salesReps: User[];
  totalFilteredOrders: number;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  salesReps,
  totalFilteredOrders,
}) => {
  const hasActiveFilters = 
    filters.salespersonId !== 'all' || 
    filters.simMode !== 'all' || 
    filters.searchQuery.trim() !== '';

  const handleReset = () => {
    onFilterChange({
      salespersonId: 'all',
      simMode: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Filter size={15} className="text-voyx-orange" />
          <span>Filter Data</span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-3 flex-wrap flex-1 justify-start md:justify-end">
          {/* Sales Rep Dropdown */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <UserCheck size={14} />
            </div>
            <select
              value={filters.salespersonId}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                onFilterChange({ ...filters, salespersonId: val });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-voyx-orange transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Sales Reps ({salesReps.length})</option>
              {salesReps.map((rep) => (
                <option key={rep.user_id} value={rep.user_id}>
                  {rep.name.trim()} (ID: {rep.user_id})
                </option>
              ))}
            </select>
          </div>

          {/* SIM Mode Filter */}
          <div className="relative min-w-[170px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Smartphone size={14} />
            </div>
            <select
              value={filters.simMode}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                onFilterChange({ ...filters, simMode: val });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-voyx-orange transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All SIM Modes</option>
              <option value={2}>eSIM Plans Only</option>
              <option value={1}>Plastic SIMs Only</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search customer, order #, product..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-voyx-orange transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* Filtered Count Badge */}
          <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 whitespace-nowrap">
            Showing <strong className="text-slate-900">{totalFilteredOrders}</strong> orders
          </div>
        </div>
      </div>
    </div>
  );
};
