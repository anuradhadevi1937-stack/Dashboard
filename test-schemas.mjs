import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

async function testSchemas() {
  console.log('--- Testing Schemas ---');
  
  // 1. Test public schema
  const supabasePublic = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
  
  const [pProd, pDest, pUsers, pOrders] = await Promise.all([
    supabasePublic.from('products').select('*', { count: 'exact' }),
    supabasePublic.from('destinations').select('*', { count: 'exact' }),
    supabasePublic.from('users').select('*', { count: 'exact' }),
    supabasePublic.from('orders').select('*', { count: 'exact' }),
  ]);
  
  console.log('Public schema counts:');
  console.log('  users:', pUsers.count, 'error:', pUsers.error?.message);
  console.log('  orders:', pOrders.count, 'error:', pOrders.error?.message);
  console.log('  products:', pProd.count, 'error:', pProd.error?.message);
  console.log('  destinations:', pDest.count, 'error:', pDest.error?.message);

  // 2. Test travel_esim schema
  try {
    const supabaseTravel = createClient(supabaseUrl, supabaseKey, { db: { schema: 'travel_esim' } });
    const [tProd, tDest, tUsers, tOrders] = await Promise.all([
      supabaseTravel.from('products').select('*', { count: 'exact' }),
      supabaseTravel.from('destinations').select('*', { count: 'exact' }),
      supabaseTravel.from('users').select('*', { count: 'exact' }),
      supabaseTravel.from('orders').select('*', { count: 'exact' }),
    ]);

    console.log('\ntravel_esim schema counts:');
    console.log('  users:', tUsers.count, 'error:', tUsers.error?.message);
    console.log('  orders:', tOrders.count, 'error:', tOrders.error?.message);
    console.log('  products:', tProd.count, 'error:', tProd.error?.message);
    console.log('  destinations:', tDest.count, 'error:', tDest.error?.message);
  } catch (e) {
    console.error('travel_esim schema error:', e.message);
  }
}

testSchemas();
