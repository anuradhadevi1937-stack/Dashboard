import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

console.log('Testing Supabase Connection:');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostic() {
  console.log('\n--- 1. TESTING TABLE COUNTS & RLS ---');
  const tables = ['users', 'orders', 'products', 'destinations'];
  
  for (const table of tables) {
    const { count, data, error } = await supabase.from(table).select('*', { count: 'exact' }).limit(3);
    if (error) {
      console.error(`Error querying ${table}:`, error.message);
    } else {
      console.log(`✓ Table [${table}]: Count = ${count}`);
      console.log(`  Sample row keys:`, data.length > 0 ? Object.keys(data[0]) : 'empty');
      if (data.length > 0) {
        console.log(`  Sample row:`, JSON.stringify(data[0], null, 2));
      }
    }
  }

  console.log('\n--- 2. TESTING DYNAMIC DATE QUERIES ---');
  const testDates = ['2026-01-01', '2026-01-02', '2026-05-26', '2026-05-30', '2026-06-11'];
  for (const dt of testDates) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date_time', dt);

    if (error) {
      console.error(`Error on date ${dt}:`, error.message);
    } else {
      const gross = data.reduce((sum, o) => sum + Number(o.amount || 0), 0);
      const discount = data.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
      console.log(`✓ Date ${dt}: Orders = ${data.length}, Gross Revenue = ₹${gross.toFixed(2)}, Discount = ₹${discount.toFixed(2)}, Net = ₹${(gross - discount).toFixed(2)}`);
    }
  }

  console.log('\n--- 3. TESTING JOIN RESOLUTION ---');
  const { data: sampleOrders } = await supabase.from('orders').select('*').limit(3);
  if (sampleOrders && sampleOrders.length > 0) {
    const custId = sampleOrders[0].user_id;
    const repId = sampleOrders[0].created_by;
    const prodId = sampleOrders[0].product_id;

    const [custRes, repRes, prodRes] = await Promise.all([
      supabase.from('users').select('*').eq('user_id', custId).single(),
      supabase.from('users').select('*').eq('user_id', repId).single(),
      supabase.from('products').select('*').eq('prod_id', prodId).single(),
    ]);

    console.log(`Order #${sampleOrders[0].order_no}:`);
    console.log(`  Customer (user_id=${custId}):`, custRes.data?.name, `(role=${custRes.data?.user_role})`);
    console.log(`  Sales Rep (created_by=${repId}):`, repRes.data?.name, `(role=${repRes.data?.user_role})`);
    console.log(`  Product (prod_id=${prodId}):`, prodRes.data?.productName, `(coverage=${prodRes.data?.coverageDestinations})`);
  }
}

runDiagnostic();
