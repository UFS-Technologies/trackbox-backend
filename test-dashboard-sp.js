const mysql = require('mysql2/promise');

async function testGetDashboard() {
    console.log('Testing CALL Get_Dashboard()...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        
        console.log('✅ Connected to DB');
        
        try {
            const [results] = await connection.query('CALL Get_Dashboard()');
            console.log('✅ CALL Get_Dashboard() success!');
            console.log('Result sets count:', results.length);
            results.forEach((rs, i) => {
                if (Array.isArray(rs)) {
                    console.log(`Set ${i} row count:`, rs.length);
                }
            });
        } catch (err) {
            console.error('❌ CALL Get_Dashboard() failed:', err.message);
        }
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

testGetDashboard();
