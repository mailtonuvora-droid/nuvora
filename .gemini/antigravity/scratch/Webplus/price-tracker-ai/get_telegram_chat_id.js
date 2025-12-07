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

if (!token) {
    console.error("Missing TELEGRAM_BOT_TOKEN");
    process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getUpdates`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const updates = JSON.parse(data);
            if (updates.ok && updates.result.length > 0) {
                // Get the last message
                const lastResult = updates.result[updates.result.length - 1];
                const chatId = lastResult.message.chat.id;
                const user = lastResult.message.from.first_name;
                console.log(`Found Chat ID for ${user}: ${chatId}`);
            } else {
                console.log("No messages found. Please send a message to the bot first.");
            }
        } catch (e) {
            console.error("Error parsing response:", e);
        }
    });
}).on("error", (err) => {
    console.error("Error: " + err.message);
});
