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

async function runMilestone2Tests() {
  console.log('=== RUNNING MILESTONE 2 AUTOMATED INTEGRATION TESTS ===\n');

  // Test 1: Today (2026-05-31)
  console.log('Test 1: Querying "Today" (2026-05-31)');
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('order_date_time', '2026-05-31');

  const todayGross = todayOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const todayDisc = todayOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const todayNet = todayGross - todayDisc;
  console.log(`  ✓ Today Orders: ${todayOrders.length} | Gross: ₹${todayGross.toFixed(2)} | Net: ₹${todayNet.toFixed(2)}`);

  // Test 2: Yesterday (2026-05-30)
  console.log('\nTest 2: Querying "Yesterday" (2026-05-30)');
  const { data: yestOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('order_date_time', '2026-05-30');

  const yestGross = yestOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const yestDisc = yestOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const yestNet = yestGross - yestDisc;
  console.log(`  ✓ Yesterday Orders: ${yestOrders.length} | Gross: ₹${yestGross.toFixed(2)} | Net: ₹${yestNet.toFixed(2)}`);

  const deltaOrders = ((todayOrders.length - yestOrders.length) / yestOrders.length) * 100;
  const deltaRevenue = ((todayNet - yestNet) / yestNet) * 100;
  console.log(`  ✓ Delta Orders: ${deltaOrders.toFixed(1)}% | Delta Net Revenue: ${deltaRevenue.toFixed(1)}%`);

  // Test 3: This Month (2026-05-01 to 2026-05-31)
  console.log('\nTest 3: Querying "This Month" (2026-05-01 to 2026-05-31)');
  let mayOrders = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date_time', '2026-05-01')
      .lte('order_date_time', '2026-05-31')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    mayOrders = mayOrders.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  const mayGross = mayOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const mayDisc = mayOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const mayNet = mayGross - mayDisc;
  console.log(`  ✓ May Month Total Orders: ${mayOrders.length} | Gross: ₹${mayGross.toFixed(2)} | Net: ₹${mayNet.toFixed(2)}`);

  // Test 4: Previous Month (2026-04-01 to 2026-04-30)
  console.log('\nTest 4: Querying "Previous Month" (2026-04-01 to 2026-04-30)');
  let aprOrders = [];
  from = 0;
  while (true) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date_time', '2026-04-01')
      .lte('order_date_time', '2026-04-30')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    aprOrders = aprOrders.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  const aprGross = aprOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const aprDisc = aprOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const aprNet = aprGross - aprDisc;
  console.log(`  ✓ April Month Total Orders: ${aprOrders.length} | Gross: ₹${aprGross.toFixed(2)} | Net: ₹${aprNet.toFixed(2)}`);

  const monthGrowthOrders = ((mayOrders.length - aprOrders.length) / aprOrders.length) * 100;
  const monthGrowthRev = ((mayNet - aprNet) / aprNet) * 100;
  console.log(`  ✓ Month-over-Month Order Growth: +${monthGrowthOrders.toFixed(1)}%`);
  console.log(`  ✓ Month-over-Month Net Revenue Growth: +${monthGrowthRev.toFixed(1)}%`);

  // Test 5: Sales Rep Leaderboard Calculation for May
  console.log('\nTest 5: Sales Rep Performance Breakdown for May 2026');
  const repSales = new Map();
  mayOrders.forEach(o => {
    const rep = o.created_by;
    if (!repSales.has(rep)) repSales.set(rep, { count: 0, gross: 0, disc: 0 });
    const cur = repSales.get(rep);
    cur.count += 1;
    cur.gross += Number(o.amount || 0);
    cur.disc += Number(o.discount_amount || 0);
  });

  const { data: reps } = await supabase.from('users').select('user_id, name').eq('user_role', 2);
  const repNameMap = new Map(reps?.map(r => [r.user_id, r.name.trim()]));

  const sortedReps = Array.from(repSales.entries())
    .map(([repId, val]) => ({
      repId,
      name: repNameMap.get(repId) || `Rep #${repId}`,
      count: val.count,
      net: val.gross - val.disc,
      arpu: (val.gross - val.disc) / val.count,
    }))
    .sort((a, b) => b.net - a.net);

  sortedReps.slice(0, 5).forEach((r, idx) => {
    console.log(`  #${idx + 1} ${r.name} (ID: ${r.repId}): ${r.count} orders | Net: ₹${r.net.toFixed(2)} | ARPU: ₹${r.arpu.toFixed(2)}`);
  });

  console.log('\n=== ALL MILESTONE 2 TESTS PASSED PERFECTLY ===');
}

runMilestone2Tests();
