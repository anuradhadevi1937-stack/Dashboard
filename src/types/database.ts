/**
 * Supabase Database Type Definitions for Voyx Sales Admin Dashboard
 */

export interface User {
  user_id: number;
  name: string;
  country_code: number;
  mobile: string;
  user_role: number; // 1 = Customer, 2 = Salesperson / Admin Staff
  created_dateTime: string;
}

export interface Order {
  order_no: number;
  order_date_time: string; // 'YYYY-MM-DD'
  user_id: number; // Customer ID (FK -> users.user_id)
  product_id: number; // Product ID (FK -> products.prod_id)
  amount: number;
  discount_amount: number;
  created_by: number; // Salesperson ID (FK -> users.user_id)
}

export interface Product {
  prod_id: number;
  addOnId: string;
  data_limit: number;
  simMode: number; // 1 = Plastic SIM, 2 = eSIM
  fupLimit: number | null;
  operatorId: number;
  additional_note: string;
  amount: number;
  productName: string;
  postFupSpeed: number | null;
  validity: number;
  coverageDestinations: string; // Comma-separated ISO3 codes, e.g. 'SGP,MYS'
  allocatedDestinations: string; // Comma-separated codes, e.g. 'SGP,MYS,SGMY'
}

export interface Destination {
  destination_id: string; // PK: ISO3 code or Region code e.g. 'SGP', 'MYS', 'AFR'
  destination_type: number; // 1 = Single Country, 2 = Regional
  destination_name: string;
  flag_path: string;
  included_destinations: string; // Comma-separated ISO3 codes for regional packs
  is_active: number; // 1 = Active, 0 = Inactive
}

export interface JoinedOrderRecord extends Order {
  customer?: User | null;
  salesperson?: User | null;
  product?: Product | null;
  destinations?: Destination[];
  net_amount: number;
}

export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'prev_month' | 'custom';

export interface DateRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  preset: DatePreset;
}

export interface KpiMetrics {
  selectedOrders: number;
  selectedGrossRevenue: number;
  selectedDiscounts: number;
  selectedNetRevenue: number;
  prevOrders: number;
  prevGrossRevenue: number;
  prevDiscounts: number;
  prevNetRevenue: number;
  ordersGrowthPct: number;
  revenueGrowthPct: number;
  aov: number;
}

export interface DailyChartPoint {
  date: string;
  formattedDate: string;
  revenue: number;
  orders: number;
  grossRevenue: number;
  discounts: number;
}

export interface MonthlyChartPoint {
  month: string; // '2026-01'
  formattedMonth: string; // 'Jan 2026'
  revenue: number;
  orders: number;
  grossRevenue: number;
  discounts: number;
}

export interface SalespersonRow {
  userId: number;
  name: string;
  mobile: string;
  periodOrders: number;
  periodRevenue: number;
  mtdOrders: number;
  mtdRevenue: number;
  arpu: number;
  prevRevenue: number;
  growthPct: number;
  rank: number;
}

export interface DestinationMetric {
  destinationId: string;
  destinationName: string;
  destinationType: number;
  flagPath: string;
  orderCount: number;
  revenue: number;
  sharePct: number;
}

export interface QuickAnalyticsData {
  topProduct: { id: number; name: string; orders: number; revenue: number } | null;
  topCustomer: { id: number; name: string; mobile: string; orders: number; revenue: number } | null;
  topSalesperson: { id: number; name: string; orders: number; revenue: number } | null;
  simModeDistribution: {
    esimCount: number;
    esimRevenue: number;
    plasticCount: number;
    plasticRevenue: number;
  };
  lifetimeStats: {
    totalUsers: number;
    totalOrders: number;
    totalSalesReps: number;
  };
}

export interface DashboardFilters {
  salespersonId: number | 'all';
  simMode: number | 'all'; // 1 = Plastic, 2 = eSIM, 'all'
  searchQuery: string;
}

export interface FullDashboardData {
  kpis: KpiMetrics;
  dailyChart: DailyChartPoint[];
  monthlyChart: MonthlyChartPoint[];
  leaderboard: SalespersonRow[];
  destinations: DestinationMetric[];
  quickAnalytics: QuickAnalyticsData;
  filteredOrders: JoinedOrderRecord[];
  allSalesReps: User[];
  databaseMaxDate: string;
}
