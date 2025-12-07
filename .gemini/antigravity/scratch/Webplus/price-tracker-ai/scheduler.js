
const fs = require('fs');

// Read port from .env or default to 3001
let port = 3001;
try {
    const env = fs.readFileSync('.env', 'utf8');
    const match = env.match(/NEXT_PUBLIC_APP_URL="?http:\/\/localhost:(\d+)"?/);
    if (match && match[1]) {
        port = match[1];
    }
} catch (e) {
    console.log('Could not read .env, defaulting to port 3001');
}

const API_URL = `http://localhost:${port}/api/monitor/check-prices`;
const INTERVAL_MS = 15 * 60 * 1000; // 15 Minutes

console.log(`[Scheduler] Starting Price Monitoring Service...`);
console.log(`[Scheduler] Target API: ${API_URL}`);
console.log(`[Scheduler] Interval: 15 minutes`);

async function checkPrices() {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] Triggering price check...`);
        const res = await fetch(API_URL, {
            method: 'POST', // Try POST first as it's an action
        });

        if (!res.ok) {
            // Try GET if POST fails (though route.ts handles both)
            const text = await res.text();
            console.error(`[Error] API returned ${res.status}: ${text}`);
            return;
        }

        const data = await res.json();
        console.log(`[Success] Checked: ${data.checked} products. Results:`, data.results);
    } catch (error) {
        console.error(`[Error] Failed to connect to server:`, error.message);
    }
}

// Run immediately on start
checkPrices();

// Set interval
setInterval(checkPrices, INTERVAL_MS);
