const fs = require('fs');
try {
    let envConfig = fs.readFileSync('.env', 'utf8');
    // Replace with or without quotes, covering common variations
    envConfig = envConfig.replace(/NEXTAUTH_URL="?http:\/\/localhost:300[05]"?/g, 'NEXTAUTH_URL="http://localhost:3001"');
    fs.writeFileSync('.env', envConfig);
    console.log('Updated .env to use port 3001');
} catch (e) {
    console.error(e);
}
