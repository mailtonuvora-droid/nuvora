const https = require('https');
const fs = require('fs');
const path = require('path');

// Load envs manually since we don't assume dotenv is installed/setup for scripts
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const token = env['WHATSAPP_ACCESS_TOKEN'];
const phoneId = env['WHATSAPP_PHONE_ID'];

if (!token || !phoneId) {
    console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID in .env.local");
    process.exit(1);
}

const data = JSON.stringify({
    messaging_product: "whatsapp",
    to: "919500649008", // Assuming India +91
    type: "template",
    template: {
        name: "hello_world",
        language: {
            code: "en_US"
        }
    }
});

const options = {
    hostname: 'graph.facebook.com',
    path: `/v21.0/${phoneId}/messages`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending test message to 919500649008...");

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response:', responseData);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
