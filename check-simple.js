const mysql = require('mysql2/promise');

async function checkSimple() {
    console.log('Testing simple query on localhost...');
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'breffini-live',
            connectTimeout: 5000
        });
        
        console.log('✅ Connected to DB');
        
        const [rows] = await connection.query('SELECT 1 + 1 AS solution');
        console.log('✅ Simple query success:', rows[0].solution);
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkSimple();
