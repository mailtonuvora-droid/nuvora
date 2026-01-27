const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const products = [
    { name: 'Grapes', price: 4.99, img: 'img/fruite-item-5.jpg', stock_quantity: 10, category: 'Fruits' },
    { name: 'Raspberries', price: 6.99, img: 'img/fruite-item-2.jpg', stock_quantity: 5, category: 'Fruits' },
    { name: 'Apricots', price: 3.50, img: 'img/fruite-item-4.jpg', stock_quantity: 0, category: 'Fruits' },
    { name: 'Banana', price: 2.99, img: 'img/fruite-item-3.jpg', stock_quantity: 15, category: 'Fruits' },
    { name: 'Oranges', price: 4.25, img: 'img/fruite-item-1.jpg', stock_quantity: 8, category: 'Fruits' }
];

async function seed() {
    console.log('--- Seeding Products ---');
    const { data, error } = await supabase.from('products').insert(products);
    if (error) console.error('Error:', error.message);
    else console.log('Products seeded successfully!');
}

seed();
