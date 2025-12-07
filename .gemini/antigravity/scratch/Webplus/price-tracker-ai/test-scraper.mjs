// Test script to debug image scraping
// Run with: node --loader ts-node/esm test-scraper.mjs

import { scrapeProduct } from './lib/scraping/playwright-scraper.ts';

const testUrls = [
    'https://www.amazon.in/dp/B0CXJWZ8K7', // Sample Amazon product
    'https://www.flipkart.com/samsung-8-kg-5-star-eco-bubble-tech-digital-inverter-motor-fully-automatic-front-load-washing-machine-hygiene-steam/p/itm8c6c7e3d7a6e6', // Sample Flipkart product
];

async function testScraper() {
    console.log('🧪 Testing scraper with sample URLs...\n');

    for (const url of testUrls) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`Testing URL: ${url}`);
        console.log('='.repeat(80));

        try {
            const result = await scrapeProduct(url);

            if (result) {
                console.log('\n✅ Scraping successful!');
                console.log('Title:', result.title);
                console.log('Price:', result.price, result.currency);
                console.log('Image URL:', result.imageUrl);
                console.log('Has Image:', !!result.imageUrl);
                console.log('Is Available:', result.isAvailable);
            } else {
                console.log('\n❌ Scraping failed - returned null');
            }
        } catch (error) {
            console.error('\n❌ Error during scraping:', error);
        }
    }
}

testScraper().catch(console.error);
