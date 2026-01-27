const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const products = [
    { name: 'Organic Mango', price: 9.99, img: 'img/fruite-item-4.jpg', stock_quantity: 25, category: 'Fruits' },
    { name: 'Fresh Pineapple', price: 12.50, img: 'img/fruite-item-3.jpg', stock_quantity: 15, category: 'Fruits' },
    { name: 'Creamy Avocado', price: 7.25, img: 'img/fruite-item-1.jpg', stock_quantity: 40, category: 'Vegetables' }
];

async function seed() {
    console.log('--- Seeding 3 Requested Sample Products ---');
    const { data, error } = await supabase.from('products').insert(products);
    if (error) console.error('Error:', error.message);
    else console.log('3 New products seeded successfully!');
}

seed();
