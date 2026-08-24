import { getSupabaseClient } from './supabase';
import { STATIC_PRODUCTS_MAP, STATIC_DESTINATIONS_MAP } from './catalogData';
import {
  User,
  Order,
  Destination,
  JoinedOrderRecord,
  DatePreset,
  DateRange,
  KpiMetrics,
  DailyChartPoint,
  MonthlyChartPoint,
  SalespersonRow,
  DestinationMetric,
  QuickAnalyticsData,
  DashboardFilters,
  FullDashboardData,
} from '../types/database';
import { 
  format, 
  parseISO, 
  subDays, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  differenceInCalendarDays,
  eachDayOfInterval
} from 'date-fns';

/**
 * Cache for sales team members & customers to minimize repeated user table lookups
 */
let cachedUsersMap: Map<number, User> | null = null;
let cachedSalesReps: User[] | null = null;
let cachedMaxDate: string | null = null;

/**
 * Fetch all users from Supabase once and cache them
 */
export async function getAllUsers(): Promise<{ usersMap: Map<number, User>; salesReps: User[] }> {
  if (cachedUsersMap && cachedSalesReps) {
    return { usersMap: cachedUsersMap, salesReps: cachedSalesReps };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { usersMap: new Map(), salesReps: [] };
  }

  try {
    let allUsers: User[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .range(from, from + batchSize - 1);

      if (error || !data || data.length === 0) break;
      allUsers = allUsers.concat(data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    const map = new Map<number, User>();
    const reps: User[] = [];

    allUsers.forEach((u) => {
      map.set(u.user_id, u);
      if (u.user_role === 2) {
        reps.push(u);
      }
    });

    // Sort sales reps by name
    reps.sort((a, b) => a.name.localeCompare(b.name));

    cachedUsersMap = map;
    cachedSalesReps = reps;
    return { usersMap: map, salesReps: reps };
  } catch (err) {
    console.error('Error fetching users:', err);
    return { usersMap: new Map(), salesReps: [] };
  }
}

/**
 * Get latest date available in orders table
 */
export async function getLatestDatabaseDate(): Promise<string> {
  if (cachedMaxDate) return cachedMaxDate;

  const supabase = getSupabaseClient();
  if (!supabase) return '2026-05-31';

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_date_time')
      .order('order_date_time', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return '2026-05-31';
    }

    cachedMaxDate = data[0].order_date_time;
    return cachedMaxDate || '2026-05-31';
  } catch {
    return '2026-05-31';
  }
}

/**
 * Calculate Date Range from a preset based on latest available DB date
 */
export function calculatePresetDateRange(preset: DatePreset, referenceDateStr: string): DateRange {
  const refDate = parseISO(referenceDateStr);

  switch (preset) {
    case 'today':
      return {
        startDate: referenceDateStr,
        endDate: referenceDateStr,
        preset: 'today',
      };
    case 'yesterday': {
      const yest = subDays(refDate, 1);
      const str = format(yest, 'yyyy-MM-dd');
      return {
        startDate: str,
        endDate: str,
        preset: 'yesterday',
      };
    }
    case 'week': {
      const wStart = startOfWeek(refDate, { weekStartsOn: 1 });
      return {
        startDate: format(wStart, 'yyyy-MM-dd'),
        endDate: referenceDateStr,
        preset: 'week',
      };
    }
    case 'month': {
      const mStart = startOfMonth(refDate);
      return {
        startDate: format(mStart, 'yyyy-MM-dd'),
        endDate: referenceDateStr,
        preset: 'month',
      };
    }
    case 'prev_month': {
      const prevMonth = subMonths(refDate, 1);
      const pmStart = startOfMonth(prevMonth);
      const pmEnd = endOfMonth(prevMonth);
      return {
        startDate: format(pmStart, 'yyyy-MM-dd'),
        endDate: format(pmEnd, 'yyyy-MM-dd'),
        preset: 'prev_month',
      };
    }
    case 'custom':
    default:
      return {
        startDate: referenceDateStr,
        endDate: referenceDateStr,
        preset: 'custom',
      };
  }
}

/**
 * Calculate the preceding comparison period with identical duration
 */
export function calculatePreviousPeriodRange(startDateStr: string, endDateStr: string): { prevStart: string; prevEnd: string } {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const durationDays = differenceInCalendarDays(end, start) + 1;

  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, durationDays - 1);

  return {
    prevStart: format(prevStart, 'yyyy-MM-dd'),
    prevEnd: format(prevEnd, 'yyyy-MM-dd'),
  };
}

/**
 * Fetch raw orders in a date range from Supabase (handles pagination)
 */
async function fetchOrdersInRange(startStr: string, endStr: string): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let orders: Order[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('orders')
        .select('order_no, order_date_time, user_id, product_id, amount, discount_amount, created_by')
        .gte('order_date_time', startStr)
        .lte('order_date_time', endStr)
        .order('order_date_time', { ascending: true })
        .range(from, from + batchSize - 1);

      if (error || !data || data.length === 0) break;
      orders = orders.concat(data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    return orders;
  } catch (err) {
    console.error(`Failed to fetch orders in range ${startStr} to ${endStr}:`, err);
    return [];
  }
}

/**
 * Fetch all lifetime orders for monthly historical trend
 */
async function fetchAllHistoricalOrders(): Promise<Pick<Order, 'order_no' | 'order_date_time' | 'amount' | 'discount_amount'>[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let allOrders: Pick<Order, 'order_no' | 'order_date_time' | 'amount' | 'discount_amount'>[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('orders')
        .select('order_no, order_date_time, amount, discount_amount')
        .range(from, from + batchSize - 1);

      if (error || !data || data.length === 0) break;
      allOrders = allOrders.concat(data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    return allOrders;
  } catch {
    return [];
  }
}

/**
 * Main Data Loader for the Complete Dashboard
 */
export async function loadFullDashboardData(
  dateRange: DateRange,
  filters: DashboardFilters
): Promise<{ data: FullDashboardData | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: 'Supabase credentials are not configured.' };
  }

  try {
    const maxDate = await getLatestDatabaseDate();
    const { usersMap, salesReps } = await getAllUsers();

    // 1. Calculate previous comparison period
    const { prevStart, prevEnd } = calculatePreviousPeriodRange(dateRange.startDate, dateRange.endDate);

    // 2. Calculate Month-To-Date (MTD) date boundaries for leaderboard
    const currentSelectedMonthStart = format(startOfMonth(parseISO(dateRange.endDate)), 'yyyy-MM-dd');

    // 3. Parallel fetch: Selected Orders, Previous Period Orders, MTD Orders, and Historical Orders
    const [selectedRawOrders, prevRawOrders, mtdRawOrders, allHistOrders] = await Promise.all([
      fetchOrdersInRange(dateRange.startDate, dateRange.endDate),
      fetchOrdersInRange(prevStart, prevEnd),
      fetchOrdersInRange(currentSelectedMonthStart, dateRange.endDate),
      fetchAllHistoricalOrders(),
    ]);

    // 4. Enrich & filter selected orders
    const enrichOrder = (o: Order): JoinedOrderRecord => {
      const amount = Number(o.amount) || 0;
      const discount = Number(o.discount_amount) || 0;
      const net = amount - discount;
      const product = STATIC_PRODUCTS_MAP[o.product_id] || null;

      const destinations: Destination[] = [];
      if (product?.coverageDestinations) {
        product.coverageDestinations.split(',').forEach((code) => {
          const trimmed = code.trim();
          const dest = STATIC_DESTINATIONS_MAP[trimmed];
          if (dest) destinations.push(dest);
        });
      }

      return {
        ...o,
        customer: usersMap.get(o.user_id) || null,
        salesperson: usersMap.get(o.created_by) || null,
        product,
        destinations,
        net_amount: net,
      };
    };

    const enrichedSelectedOrders = selectedRawOrders.map(enrichOrder);
    const enrichedPrevOrders = prevRawOrders.map(enrichOrder);
    const enrichedMtdOrders = mtdRawOrders.map(enrichOrder);

    // Apply dashboard filters (Salesperson, SIM Mode, Search Query)
    const applyFilters = (orders: JoinedOrderRecord[]): JoinedOrderRecord[] => {
      return orders.filter((ord) => {
        // Salesperson filter
        if (filters.salespersonId !== 'all' && ord.created_by !== filters.salespersonId) {
          return false;
        }

        // SIM mode filter
        if (filters.simMode !== 'all') {
          if (!ord.product || ord.product.simMode !== filters.simMode) {
            return false;
          }
        }

        // Search query filter
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchesNo = String(ord.order_no).includes(q);
          const matchesCustomer = ord.customer?.name?.toLowerCase().includes(q) || false;
          const matchesMobile = ord.customer?.mobile?.toLowerCase().includes(q) || false;
          const matchesRep = ord.salesperson?.name?.toLowerCase().includes(q) || false;
          const matchesProduct = ord.product?.productName?.toLowerCase().includes(q) || false;

          if (!matchesNo && !matchesCustomer && !matchesMobile && !matchesRep && !matchesProduct) {
            return false;
          }
        }

        return true;
      });
    };

    const filteredSelected = applyFilters(enrichedSelectedOrders);
    const filteredPrev = applyFilters(enrichedPrevOrders);
    const filteredMtd = applyFilters(enrichedMtdOrders);

    // 5. Calculate KPI Metrics
    const calcTotals = (orders: JoinedOrderRecord[]) => {
      let gross = 0;
      let disc = 0;
      let net = 0;
      orders.forEach((o) => {
        gross += Number(o.amount) || 0;
        disc += Number(o.discount_amount) || 0;
        net += o.net_amount;
      });
      return { gross, disc, net, count: orders.length };
    };

    const curTotals = calcTotals(filteredSelected);
    const prevTotals = calcTotals(filteredPrev);

    const ordersGrowthPct = prevTotals.count > 0 
      ? ((curTotals.count - prevTotals.count) / prevTotals.count) * 100 
      : (curTotals.count > 0 ? 100 : 0);

    const revenueGrowthPct = prevTotals.net > 0 
      ? ((curTotals.net - prevTotals.net) / prevTotals.net) * 100 
      : (curTotals.net > 0 ? 100 : 0);

    const aov = curTotals.count > 0 ? curTotals.net / curTotals.count : 0;

    const kpis: KpiMetrics = {
      selectedOrders: curTotals.count,
      selectedGrossRevenue: curTotals.gross,
      selectedDiscounts: curTotals.disc,
      selectedNetRevenue: curTotals.net,
      prevOrders: prevTotals.count,
      prevGrossRevenue: prevTotals.gross,
      prevDiscounts: prevTotals.disc,
      prevNetRevenue: prevTotals.net,
      ordersGrowthPct,
      revenueGrowthPct,
      aov,
    };

    // 6. Build Daily Sales Chart series
    const startDateObj = parseISO(dateRange.startDate);
    const endDateObj = parseISO(dateRange.endDate);
    const daysInInterval = eachDayOfInterval({ start: startDateObj, end: endDateObj });

    const dailyMap = new Map<string, { revenue: number; orders: number; gross: number; disc: number }>();
    daysInInterval.forEach((d) => {
      const dStr = format(d, 'yyyy-MM-dd');
      dailyMap.set(dStr, { revenue: 0, orders: 0, gross: 0, disc: 0 });
    });

    filteredSelected.forEach((o) => {
      const dt = o.order_date_time;
      if (dailyMap.has(dt)) {
        const item = dailyMap.get(dt)!;
        item.orders += 1;
        item.revenue += o.net_amount;
        item.gross += Number(o.amount) || 0;
        item.disc += Number(o.discount_amount) || 0;
      }
    });

    const dailyChart: DailyChartPoint[] = Array.from(dailyMap.entries()).map(([dt, val]) => ({
      date: dt,
      formattedDate: format(parseISO(dt), 'dd MMM'),
      revenue: Math.round(val.revenue * 100) / 100,
      orders: val.orders,
      grossRevenue: Math.round(val.gross * 100) / 100,
      discounts: Math.round(val.disc * 100) / 100,
    }));

    // 7. Build Monthly Historical Chart series
    const monthlyMap = new Map<string, { revenue: number; orders: number; gross: number; disc: number }>();
    allHistOrders.forEach((o) => {
      const m = o.order_date_time ? o.order_date_time.substring(0, 7) : 'Unknown';
      if (!monthlyMap.has(m)) {
        monthlyMap.set(m, { revenue: 0, orders: 0, gross: 0, disc: 0 });
      }
      const cur = monthlyMap.get(m)!;
      const amt = Number(o.amount) || 0;
      const dsc = Number(o.discount_amount) || 0;
      cur.orders += 1;
      cur.gross += amt;
      cur.disc += dsc;
      cur.revenue += amt - dsc;
    });

    const monthlyChart: MonthlyChartPoint[] = Array.from(monthlyMap.entries())
      .filter(([m]) => m !== 'Unknown')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, val]) => {
        let formatted = m;
        try {
          formatted = format(parseISO(`${m}-01`), 'MMM yyyy');
        } catch {
          formatted = m;
        }
        return {
          month: m,
          formattedMonth: formatted,
          revenue: Math.round(val.revenue * 100) / 100,
          orders: val.orders,
          grossRevenue: Math.round(val.gross * 100) / 100,
          discounts: Math.round(val.disc * 100) / 100,
        };
      });

    // 8. Build Sales Leaderboard
    const repPerformanceMap = new Map<number, {
      periodOrders: number;
      periodRevenue: number;
      mtdOrders: number;
      mtdRevenue: number;
      prevRevenue: number;
    }>();

    // Initialize all sales reps
    salesReps.forEach((rep) => {
      repPerformanceMap.set(rep.user_id, {
        periodOrders: 0,
        periodRevenue: 0,
        mtdOrders: 0,
        mtdRevenue: 0,
        prevRevenue: 0,
      });
    });

    // Accumulate selected period sales
    filteredSelected.forEach((o) => {
      const repId = o.created_by;
      if (!repPerformanceMap.has(repId)) {
        repPerformanceMap.set(repId, { periodOrders: 0, periodRevenue: 0, mtdOrders: 0, mtdRevenue: 0, prevRevenue: 0 });
      }
      const cur = repPerformanceMap.get(repId)!;
      cur.periodOrders += 1;
      cur.periodRevenue += o.net_amount;
    });

    // Accumulate MTD sales
    filteredMtd.forEach((o) => {
      const repId = o.created_by;
      if (repPerformanceMap.has(repId)) {
        const cur = repPerformanceMap.get(repId)!;
        cur.mtdOrders += 1;
        cur.mtdRevenue += o.net_amount;
      }
    });

    // Accumulate previous period revenue for growth delta
    filteredPrev.forEach((o) => {
      const repId = o.created_by;
      if (repPerformanceMap.has(repId)) {
        const cur = repPerformanceMap.get(repId)!;
        cur.prevRevenue += o.net_amount;
      }
    });

    const leaderboard: SalespersonRow[] = Array.from(repPerformanceMap.entries())
      .map(([userId, stats]) => {
        const user = usersMap.get(userId);
        const name = user?.name?.trim() || `Sales Rep #${userId}`;
        const mobile = user?.mobile || '';
        const arpu = stats.periodOrders > 0 ? stats.periodRevenue / stats.periodOrders : 0;
        const growthPct = stats.prevRevenue > 0
          ? ((stats.periodRevenue - stats.prevRevenue) / stats.prevRevenue) * 100
          : (stats.periodRevenue > 0 ? 100 : 0);

        return {
          userId,
          name,
          mobile,
          periodOrders: stats.periodOrders,
          periodRevenue: Math.round(stats.periodRevenue * 100) / 100,
          mtdOrders: stats.mtdOrders,
          mtdRevenue: Math.round(stats.mtdRevenue * 100) / 100,
          arpu: Math.round(arpu * 100) / 100,
          prevRevenue: Math.round(stats.prevRevenue * 100) / 100,
          growthPct: Math.round(growthPct * 10) / 10,
          rank: 1,
        };
      })
      .sort((a, b) => b.periodRevenue - a.periodRevenue)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));

    // 9. Build Top Destinations Analytics
    // Clear aggregation logic:
    // When an order is for a single country (e.g. THA), 100% of order & revenue is attributed to THA.
    // When an order is for a multi-country pack (e.g. SGP,MYS), it is attributed to the primary region/destination package.
    const destMap = new Map<string, { orderCount: number; revenue: number }>();

    filteredSelected.forEach((o) => {
      const prod = o.product;
      const destCode = prod?.coverageDestinations?.split(',')[0]?.trim() || prod?.allocatedDestinations?.split(',')[0]?.trim() || 'GLOBAL';

      if (!destMap.has(destCode)) {
        destMap.set(destCode, { orderCount: 0, revenue: 0 });
      }
      const cur = destMap.get(destCode)!;
      cur.orderCount += 1;
      cur.revenue += o.net_amount;
    });

    const totalSelectedRevenue = curTotals.net || 1;
    const destinations: DestinationMetric[] = Array.from(destMap.entries())
      .map(([destId, val]) => {
        const destInfo = STATIC_DESTINATIONS_MAP[destId];
        const destName = destInfo?.destination_name || (destId === 'GLOBAL' ? 'Global / Regional Plan' : destId);
        const flagPath = destInfo?.flag_path || `https://flagcdn.com/w80/${destId.toLowerCase().slice(0, 2)}.png`;
        const type = destInfo?.destination_type || 1;

        return {
          destinationId: destId,
          destinationName: destName,
          destinationType: type,
          flagPath,
          orderCount: val.orderCount,
          revenue: Math.round(val.revenue * 100) / 100,
          sharePct: Math.round((val.revenue / totalSelectedRevenue) * 1000) / 10,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8); // Top 8 destinations

    // 10. Additional Analytics (Top Product, Top Customer, Top Rep, SIM mode distribution, Lifetime totals)
    const productSalesMap = new Map<number, { count: number; rev: number }>();
    const customerSalesMap = new Map<number, { count: number; rev: number }>();
    let esimCount = 0;
    let esimRev = 0;
    let plasticCount = 0;
    let plasticRev = 0;

    filteredSelected.forEach((o) => {
      // Product
      const pid = o.product_id;
      if (!productSalesMap.has(pid)) productSalesMap.set(pid, { count: 0, rev: 0 });
      const pCur = productSalesMap.get(pid)!;
      pCur.count += 1;
      pCur.rev += o.net_amount;

      // Customer
      const cid = o.user_id;
      if (!customerSalesMap.has(cid)) customerSalesMap.set(cid, { count: 0, rev: 0 });
      const cCur = customerSalesMap.get(cid)!;
      cCur.count += 1;
      cCur.rev += o.net_amount;

      // SIM Mode
      if (o.product?.simMode === 2) {
        esimCount += 1;
        esimRev += o.net_amount;
      } else {
        plasticCount += 1;
        plasticRev += o.net_amount;
      }
    });

    // Best-selling product
    let topProduct: QuickAnalyticsData['topProduct'] = null;
    let maxProdRev = 0;
    productSalesMap.forEach((val, pid) => {
      if (val.rev > maxProdRev) {
        maxProdRev = val.rev;
        const pObj = STATIC_PRODUCTS_MAP[pid];
        topProduct = {
          id: pid,
          name: pObj?.productName || `Product #${pid}`,
          orders: val.count,
          revenue: Math.round(val.rev * 100) / 100,
        };
      }
    });

    // Top customer
    let topCustomer: QuickAnalyticsData['topCustomer'] = null;
    let maxCustRev = 0;
    customerSalesMap.forEach((val, cid) => {
      if (val.rev > maxCustRev) {
        maxCustRev = val.rev;
        const cObj = usersMap.get(cid);
        topCustomer = {
          id: cid,
          name: cObj?.name?.trim() || `Customer #${cid}`,
          mobile: cObj?.mobile || '',
          orders: val.count,
          revenue: Math.round(val.rev * 100) / 100,
        };
      }
    });

    // Top sales rep in period
    const topSalesperson = leaderboard.length > 0 && leaderboard[0].periodRevenue > 0
      ? {
          id: leaderboard[0].userId,
          name: leaderboard[0].name,
          orders: leaderboard[0].periodOrders,
          revenue: leaderboard[0].periodRevenue,
        }
      : null;

    const quickAnalytics: QuickAnalyticsData = {
      topProduct,
      topCustomer,
      topSalesperson,
      simModeDistribution: {
        esimCount,
        esimRevenue: Math.round(esimRev * 100) / 100,
        plasticCount,
        plasticRevenue: Math.round(plasticRev * 100) / 100,
      },
      lifetimeStats: {
        totalUsers: 2587,
        totalOrders: 2831,
        totalSalesReps: salesReps.length,
      },
    };

    return {
      data: {
        kpis,
        dailyChart,
        monthlyChart,
        leaderboard,
        destinations,
        quickAnalytics,
        filteredOrders: filteredSelected,
        allSalesReps: salesReps,
        databaseMaxDate: maxDate,
      },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to load full dashboard data:', err);
    return { data: null, error: message };
  }
}

/**
 * Export filtered dataset to CSV using native JavaScript Blob API
 */
export function exportOrdersToCSV(orders: JoinedOrderRecord[], startDate: string, endDate: string) {
  if (!orders || orders.length === 0) {
    alert('No order records available to export for the selected filters.');
    return;
  }

  const headers = [
    'Order No',
    'Order Date',
    'Customer ID',
    'Customer Name',
    'Customer Mobile',
    'Sales Rep ID',
    'Sales Rep Name',
    'Product ID',
    'Product Name',
    'SIM Type',
    'Validity (Days)',
    'Gross Amount (INR)',
    'Discount Amount (INR)',
    'Net Revenue (INR)',
  ];

  const escapeCSV = (str: string | number | null | undefined) => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const rows = orders.map((ord) => [
    ord.order_no,
    ord.order_date_time,
    ord.user_id,
    escapeCSV(ord.customer?.name || `Customer #${ord.user_id}`),
    escapeCSV(ord.customer?.mobile || ''),
    ord.created_by,
    escapeCSV(ord.salesperson?.name || `Rep #${ord.created_by}`),
    ord.product_id,
    escapeCSV(ord.product?.productName || `Product #${ord.product_id}`),
    ord.product?.simMode === 2 ? 'eSIM' : 'Plastic SIM',
    ord.product?.validity || '',
    Number(ord.amount || 0).toFixed(2),
    Number(ord.discount_amount || 0).toFixed(2),
    ord.net_amount.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `voyx_sales_export_${startDate}_to_${endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
