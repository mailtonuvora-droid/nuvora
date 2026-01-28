const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkOrders() {
    console.log('Checking latest orders...');
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Found', data.length, 'recent orders:');
        data.forEach(order => {
            console.log(`- ID: ${order.id}`);
            console.log(`  Date: ${order.created_at}`);
            console.log(`  Total: ${order.total_amount}`);
            console.log(`  Items Count: ${order.items ? order.items.length : 0}`);
            if (order.items) {
                order.items.forEach(item => console.log(`    - ${item.name} x ${item.quantity}`));
            }
            console.log('-------------------');
        });
    } else {
        console.log('No orders found in the database.');
    }
}

checkOrders();
