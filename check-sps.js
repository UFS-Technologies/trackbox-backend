const mysql = require('mysql2/promise');

async function checkSPs() {
    console.log('Checking Stored Procedures in breffini-live...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        
        console.log('✅ Connected to DB');
        
        const [rows] = await connection.query("SHOW PROCEDURE STATUS WHERE Db = 'breffini-live'");
        console.log('Found SPs:', rows.length);
        rows.forEach(row => console.log(` - ${row.Name}`));
        
        const hasDashboard = rows.some(row => row.Name === 'Get_Dashboard');
        if (hasDashboard) {
            console.log('✅ Get_Dashboard exists.');
            console.log('Testing execution...');
            const [results] = await connection.query('CALL Get_Dashboard()');
            console.log('Execution successful. Result count:', results.length);
        } else {
            console.log('❌ Get_Dashboard DOES NOT exist!');
        }
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkSPs();
