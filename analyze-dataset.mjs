import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'), 
  getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
);

async function analyzeFullDataset() {
  console.log('--- Analyzing Complete Dataset for Milestone 2 ---');
  
  // 1. Min and Max Date
  const { data: dateMinMax } = await supabase
    .from('orders')
    .select('order_date_time')
    .order('order_date_time', { ascending: true })
    .limit(1);
    
  const { data: dateMax } = await supabase
    .from('orders')
    .select('order_date_time')
    .order('order_date_time', { ascending: false })
    .limit(1);

  console.log('Date range in DB:', dateMinMax?.[0]?.order_date_time, 'to', dateMax?.[0]?.order_date_time);

  // 2. Fetch all sales reps (user_role = 2)
  const { data: salesReps } = await supabase
    .from('users')
    .select('user_id, name, user_role, mobile')
    .eq('user_role', 2);

  console.log(`Sales Reps (user_role=2): ${salesReps?.length}`);
  salesReps?.forEach(r => console.log(`  #${r.user_id}: ${r.name.trim()}`));

  // 3. Monthly distribution across the entire database
  // Since orders is ~2831 rows, we can fetch all in chunks of 1000
  let allOrders = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('orders')
      .select('order_no, order_date_time, amount, discount_amount, user_id, product_id, created_by')
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allOrders = allOrders.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log(`\nSuccessfully fetched all ${allOrders.length} orders for analysis!`);

  // Group by Month
  const monthlyMap = new Map();
  allOrders.forEach(o => {
    const m = o.order_date_time ? o.order_date_time.substring(0, 7) : 'Unknown';
    if (!monthlyMap.has(m)) monthlyMap.set(m, { count: 0, gross: 0, disc: 0 });
    const cur = monthlyMap.get(m);
    cur.count += 1;
    cur.gross += Number(o.amount) || 0;
    cur.disc += Number(o.discount_amount) || 0;
  });

  console.log('\nMonthly Aggregates across Entire DB:');
  Array.from(monthlyMap.entries()).sort().forEach(([m, val]) => {
    console.log(`  ${m}: ${val.count} orders | Gross: ₹${val.gross.toFixed(2)} | Net: ₹${(val.gross - val.disc).toFixed(2)}`);
  });

  // Top Sales Reps by total revenue
  const repSales = new Map();
  allOrders.forEach(o => {
    const rep = o.created_by;
    if (!repSales.has(rep)) repSales.set(rep, { count: 0, rev: 0 });
    const cur = repSales.get(rep);
    cur.count += 1;
    cur.rev += (Number(o.amount) || 0) - (Number(o.discount_amount) || 0);
  });

  const repNames = new Map(salesReps?.map(r => [r.user_id, r.name.trim()]));
  console.log('\nTop Sales Reps Lifetime:');
  Array.from(repSales.entries())
    .sort((a, b) => b[1].rev - a[1].rev)
    .forEach(([repId, val]) => {
      console.log(`  ${repNames.get(repId) || 'User #' + repId} (ID: ${repId}): ${val.count} orders | ₹${val.rev.toFixed(2)}`);
    });
}

analyzeFullDataset();
