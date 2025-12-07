const fs = require('fs');
try {
    const envConfig = fs.readFileSync('.env', 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('NEXTAUTH_URL') || trimmed.startsWith('PORT')) {
            console.log(trimmed);
        }
    });
} catch (e) {
    console.error(e);
}
