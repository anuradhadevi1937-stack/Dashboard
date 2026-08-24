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

async function inspectDateDistributions() {
  console.log('Fetching distinct order dates...');
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_date_time, amount, discount_amount')
    .order('order_date_time', { ascending: true });

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  const dateMap = new Map();
  orders.forEach((o) => {
    const dt = o.order_date_time;
    if (!dateMap.has(dt)) {
      dateMap.set(dt, { count: 0, gross: 0, disc: 0 });
    }
    const cur = dateMap.get(dt);
    cur.count += 1;
    cur.gross += Number(o.amount) || 0;
    cur.disc += Number(o.discount_amount) || 0;
  });

  console.log(`Total Orders in DB: ${orders.length}`);
  console.log(`Total Unique Dates: ${dateMap.size}`);
  
  console.log('\n--- Sample Date Breakdown (First 10 & Last 10 Dates) ---');
  const allDates = Array.from(dateMap.entries());
  
  console.log('First 5 Dates:');
  allDates.slice(0, 5).forEach(([dt, val]) => {
    console.log(`  ${dt}: ${val.count} orders | Gross: ₹${val.gross.toFixed(2)} | Net: ₹${(val.gross - val.disc).toFixed(2)}`);
  });

  console.log('\nMiddle 5 Dates (e.g. late May 2026):');
  allDates.slice(Math.floor(allDates.length / 2), Math.floor(allDates.length / 2) + 5).forEach(([dt, val]) => {
    console.log(`  ${dt}: ${val.count} orders | Gross: ₹${val.gross.toFixed(2)} | Net: ₹${(val.gross - val.disc).toFixed(2)}`);
  });

  console.log('\nLast 5 Dates:');
  allDates.slice(-5).forEach(([dt, val]) => {
    console.log(`  ${dt}: ${val.count} orders | Gross: ₹${val.gross.toFixed(2)} | Net: ₹${(val.gross - val.disc).toFixed(2)}`);
  });
}

inspectDateDistributions();
