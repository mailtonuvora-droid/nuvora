const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://raumehtlorjmapobfymi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdW1laHRsb3JqbWFwb2JmeW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjA0MjksImV4cCI6MjA4NDkzNjQyOX0.JtBkQxcX1TGAqNuLg3-gpXRH-_byJzpe_YxBXEMkyto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndCreateBucket() {
    console.log('--- Supabase Storage Health Check ---');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('Error listing buckets:', bucketError.message);
        return;
    }

    let target = buckets.find(b => b.name === 'product-images');

    if (!target) {
        console.log('Bucket "product-images" not found. Attempting to create...');
        const { data, error } = await supabase.storage.createBucket('product-images', {
            public: true
        });
        if (error) console.error('Error creating bucket:', error.message);
        else console.log('Bucket created successfully!');
    } else {
        console.log('Bucket "product-images" already exists.');
    }
}

checkAndCreateBucket();
