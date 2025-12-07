const https = require('https');
const fs = require('fs');
const path = require('path');

// Load envs
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const token = env['TELEGRAM_BOT_TOKEN'];
const chatId = env['TELEGRAM_CHAT_ID'];

if (!token || !chatId) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

const data = JSON.stringify({
    chat_id: chatId,
    text: "✅ *Price Tracker Pro*: Integration Successful!\n\nYou will now receive instant alerts here.",
    parse_mode: "Markdown"
});

const options = {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Sending test message to ${chatId}...`);

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(responseData);
            if (result.ok) {
                console.log("Success! Message sent.");
            } else {
                console.error("API Error:", result);
            }
        } catch (e) {
            console.error("Response Parse Error:", e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.write(data);
req.end();
