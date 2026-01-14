const mysql = require('mysql2/promise');

const hosts = [
    '174.138.123.156',
    '68.183.80.95',
    '49.13.87.182',
    'localhost'
];

async function testConnections() {
    for (const host of hosts) {
        console.log(`Testing host: ${host}...`);
        try {
            const connection = await mysql.createConnection({
                host: host,
                user: 'root',
                password: '@MuFsPwd123',
                connectTimeout: 5000
            });
            console.log(`✅ SUCCESS: Connected to ${host}`);
            await connection.end();
        } catch (err) {
            console.log(`❌ FAILED: ${host} - ${err.message}`);
        }
    }
}

testConnections();
