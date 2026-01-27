const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTracking() {
    const testEmail = 'mailtonuvora@gmail.com';
    console.log(`--- Testing Order Tracking for ${testEmail} ---`);

    try {
        // 1. Find user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .single();

        if (userError) throw userError;
        console.log('User found:', user);

        // 2. Fetch orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        console.log('Orders found:', orders.length);

        orders.forEach(order => {
            console.log(`- Order #${order.id.slice(0, 8)}: $${order.total_amount} | Status: ${order.status}`);
        });

    } catch (err) {
        console.error('Tracking test failed:', err.message);
    }
}

testTracking();
