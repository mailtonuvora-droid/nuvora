const fs = require('fs');
try {
    let envConfig = fs.readFileSync('.env', 'utf8');
    envConfig = envConfig.replace('NEXT_PUBLIC_APP_URL="http://localhost:3005"', 'NEXT_PUBLIC_APP_URL="http://localhost:3001"');
    fs.writeFileSync('.env', envConfig);
    console.log('Updated NEXT_PUBLIC_APP_URL to port 3001');
} catch (e) {
    console.error(e);
}
