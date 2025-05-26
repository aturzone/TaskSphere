
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    
    return 'localhost';
}

const ip = getLocalIP();
console.log('\n=== TaskFlow Network Information ===');
console.log(`Server IP: ${ip}`);
console.log(`Frontend URL: http://${ip}:8080`);
console.log(`Backend URL: http://${ip}:3001`);
console.log(`Health Check: http://${ip}:3001/api/health`);
console.log('=====================================\n');

module.exports = { getLocalIP };
