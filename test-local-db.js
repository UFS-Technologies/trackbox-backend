const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing local connection to DESKTOP-IK6ME8M...');
    try {
        const connection = await mysql.createConnection({
            host: 'DESKTOP-IK6ME8M',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        console.log('✅ Connection successful!');
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('Test query result:', rows[0].solution);
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();
