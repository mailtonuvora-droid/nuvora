const fs = require('fs');

try {
    let envConfig = fs.readFileSync('.env', 'utf8');

    if (!envConfig.includes('AUTH_TRUST_HOST=')) {
        envConfig += `\nAUTH_TRUST_HOST=true`;
        fs.writeFileSync('.env', envConfig);
        console.log('Added AUTH_TRUST_HOST=true');
    } else {
        console.log('AUTH_TRUST_HOST is already present');
    }
} catch (e) {
    console.error(e);
}
