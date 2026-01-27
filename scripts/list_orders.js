const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAllOrders() {
    console.log('--- Listing All Orders ---');
    const { data: orders, error } = await supabase.from('orders').select('*, users(email)');
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Total Orders:', orders.length);
        orders.forEach(o => {
            console.log(`- Order #${o.id.slice(0, 8)} | Email: ${o.users?.email} | Total: $${o.total_amount}`);
        });
    }
}

listAllOrders();
