import { useState, useEffect, useTransition } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { Filters } from './components/Filters';
import { DailySalesChart } from './components/DailySalesChart';
import { MonthlySalesChart } from './components/MonthlySalesChart';
import { SalesLeaderboard } from './components/SalesLeaderboard';
import { TopDestinations } from './components/TopDestinations';
import { QuickAnalytics } from './components/QuickAnalytics';
import { WalletSummaryModal } from './components/WalletSummaryModal';
import { 
  loadFullDashboardData, 
  calculatePresetDateRange, 
  getLatestDatabaseDate, 
  exportOrdersToCSV 
} from './lib/dashboard';
import { 
  DateRange, 
  DashboardFilters, 
  FullDashboardData 
} from './types/database';
import { 
  ShoppingBag, 
  AlertCircle, 
  UserCheck, 
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [databaseMaxDate, setDatabaseMaxDate] = useState<string>('2026-05-31');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2026-05-31',
    endDate: '2026-05-31',
    preset: 'today',
  });

  const [filters, setFilters] = useState<DashboardFilters>({
    salespersonId: 'all',
    simMode: 'all',
    searchQuery: '',
  });

  const [dashboardData, setDashboardData] = useState<FullDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  const [, startTransition] = useTransition();

  // Initialize latest database date and initial date range
  useEffect(() => {
    getLatestDatabaseDate().then((maxDt) => {
      setDatabaseMaxDate(maxDt);
      // Default to "today" (latest date in DB e.g. 2026-05-31)
      const initialRange = calculatePresetDateRange('today', maxDt);
      setDateRange(initialRange);
    });
  }, []);

  // Fetch full dashboard data whenever dateRange or filters change
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const res = await loadFullDashboardData(dateRange, filters);
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setDashboardData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  }, [dateRange, filters]);

  // Handle date preset or range change
  const handleDateRangeChange = (newRange: DateRange) => {
    startTransition(() => {
      if (newRange.preset !== 'custom') {
        const calculated = calculatePresetDateRange(newRange.preset, databaseMaxDate);
        setDateRange(calculated);
      } else {
        setDateRange(newRange);
      }
    });
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (!dashboardData) return;
    exportOrdersToCSV(dashboardData.filteredOrders, dateRange.startDate, dateRange.endDate);
  };

  const getPeriodLabel = () => {
    if (dateRange.preset === 'today') return 'Today (31 May)';
    if (dateRange.preset === 'yesterday') return 'Yesterday (30 May)';
    if (dateRange.preset === 'week') return 'This Week';
    if (dateRange.preset === 'month') return 'This Month (May)';
    if (dateRange.preset === 'prev_month') return 'Previous Month (April)';
    return `${dateRange.startDate} to ${dateRange.endDate}`;
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onExportCSV={handleExportCSV}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        filteredOrdersCount={dashboardData?.filteredOrders.length || 0}
        databaseMaxDate={databaseMaxDate}
      />

      {/* Top Loading Progress Bar */}
      {loading && (
        <div className="w-full bg-teal-950/60 h-1 overflow-hidden">
          <div className="bg-teal-500 h-full animate-pulse w-full shadow-lg shadow-teal-500/50" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0" />
              <div>
                <strong>Database Error:</strong> {error}
              </div>
            </div>
            <button 
              onClick={fetchData}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 rounded-xl font-bold text-xs"
            >
              Retry Query
            </button>
          </div>
        )}

        {/* 1. Primary KPI Cards */}
        {dashboardData && (
          <KpiCards 
            kpis={dashboardData.kpis} 
            periodLabel={getPeriodLabel()} 
          />
        )}

        {/* 2. Multi-Dimensional Filter Bar */}
        {dashboardData && (
          <Filters
            filters={filters}
            onFilterChange={(f) => startTransition(() => setFilters(f))}
            salesReps={dashboardData.allSalesReps}
            totalFilteredOrders={dashboardData.filteredOrders.length}
          />
        )}

        {/* 3. Sales Charts (Daily Trend & Monthly Trajectory) */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailySalesChart 
              data={dashboardData.dailyChart} 
              periodLabel={getPeriodLabel()} 
            />
            <MonthlySalesChart 
              data={dashboardData.monthlyChart} 
            />
          </div>
        )}

        {/* 4. Main Grid: Sales Leaderboard & Top Destinations */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Leaderboard Table (2 Columns) */}
            <div className="lg:col-span-2">
              <SalesLeaderboard 
                leaderboard={dashboardData.leaderboard}
                periodLabel={getPeriodLabel()}
              />
            </div>

            {/* Top Destinations (1 Column) */}
            <div className="lg:col-span-1">
              <TopDestinations 
                destinations={dashboardData.destinations}
                periodLabel={getPeriodLabel()}
              />
            </div>
          </div>
        )}

        {/* 5. Additional Analytics & Registry Cards */}
        {dashboardData && (
          <QuickAnalytics 
            data={dashboardData.quickAnalytics}
            periodLabel={getPeriodLabel()}
          />
        )}

        {/* 6. Live Filtered Orders Feed Table */}
        {dashboardData && (
          <div className="navy-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Filtered Orders Feed ({getPeriodLabel()})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live Supabase transaction records ({dashboardData.filteredOrders.length} orders match active filters)
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all hover:border-teal-500/50"
              >
                <FileSpreadsheet size={14} className="text-teal-400" />
                <span>Export Filtered Table</span>
              </button>
            </div>

            {dashboardData.filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No orders found matching the active date range and filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-3">Order #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Sales Rep</th>
                      <th className="py-3 px-4 text-right">Gross</th>
                      <th className="py-3 px-4 text-right">Discount</th>
                      <th className="py-3 px-4 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dashboardData.filteredOrders.slice(0, 50).map((ord) => (
                      <tr key={ord.order_no} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                            #{ord.order_no}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                          {ord.order_date_time}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-white">
                            {ord.customer?.name?.trim() || `Customer #${ord.user_id}`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {ord.customer?.mobile ? `+${ord.customer.country_code || 91} ${ord.customer.mobile}` : `ID: #${ord.user_id}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="max-w-[280px]">
                            <div className="font-bold text-slate-200 text-xs truncate" title={ord.product?.productName || `Product #${ord.product_id}`}>
                              {ord.product?.productName || `Product #${ord.product_id}`}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                                ord.product?.simMode === 2 
                                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {ord.product?.simMode === 2 ? 'eSIM' : 'Plastic SIM'}
                              </span>
                              {ord.product?.validity && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {ord.product.validity} Days
                                </span>
                              )}
                              {ord.destinations && ord.destinations.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  📍 {ord.destinations.map(d => d.destination_name).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                            <UserCheck size={13} className="text-teal-400" />
                            <span className="font-medium">{ord.salesperson?.name?.trim() || `Rep #${ord.created_by}`}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-400">
                          {formatINR(ord.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-rose-400">
                          {Number(ord.discount_amount) > 0 ? `-${formatINR(ord.discount_amount)}` : '₹0'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-extrabold text-emerald-400">
                          {formatINR(ord.net_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dashboardData.filteredOrders.length > 50 && (
                  <div className="p-3 text-center text-slate-500 text-xs border-t border-slate-800 bg-slate-950/30">
                    Displaying first 50 of {dashboardData.filteredOrders.length} orders. Use <strong>Export CSV</strong> above to download the full filtered dataset.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Wallet Summary Modal */}
      {dashboardData && (
        <WalletSummaryModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          salesReps={dashboardData.allSalesReps}
        />
      )}
    </div>
  );
}
