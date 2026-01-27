const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpload() {
    console.log('--- Testing Upload to "product-images" ---');
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload('test.txt', 'Hello World', { upsert: true });

    if (error) {
        console.error('Upload Failed:', error.message);
    } else {
        console.log('Upload Success!', data);
    }
}

testUpload();
