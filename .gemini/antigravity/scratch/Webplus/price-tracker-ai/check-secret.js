const fs = require('fs');
const crypto = require('crypto');

try {
    let envConfig = fs.readFileSync('.env', 'utf8');

    if (!envConfig.includes('NEXTAUTH_SECRET=')) {
        const secret = crypto.randomBytes(32).toString('hex');
        envConfig += `\nNEXTAUTH_SECRET="${secret}"`;
        fs.writeFileSync('.env', envConfig);
        console.log('Added missing NEXTAUTH_SECRET');
    } else {
        // Check if it's empty or placeholder, though less critical if present. 
        // For now just confirming presence.
        console.log('NEXTAUTH_SECRET is present');
    }
} catch (e) {
    console.error(e);
}
