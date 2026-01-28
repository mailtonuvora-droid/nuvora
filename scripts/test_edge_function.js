const FUNCTION_URL = 'https://raumehtlorjmapobfymi.supabase.co/functions/v1/hyper-endpoint';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const mockOrder = {
    type: 'INSERT',
    table: 'orders',
    record: {
        id: 'TEST-MANUAL-' + Date.now(),
        total_amount: 999.99,
        shipping_address: '123 Test Street, Cyber City, 600001',
        items: [
            { name: 'Test Product 1', quantity: 2, price: 400 },
            { name: 'Test Product 2', quantity: 1, price: 199.99 }
        ],
        created_at: new Date().toISOString(),
        status: 'pending'
    }
};

async function testFunction() {
    console.log('🚀 Triggering Edge Function manually...');
    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockOrder)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ Success! Response:', data);
        } else {
            console.error('❌ Failed! Status:', response.status);
            console.error('Data:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFunction();
