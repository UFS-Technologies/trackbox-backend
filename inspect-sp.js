const mysql = require('mysql2/promise');

async function checkUserSP() {
    console.log('Checking check_User stored procedure in DB...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        
        console.log('✅ Connected to DB');
        
        const [rows] = await connection.query('SHOW CREATE PROCEDURE check_User');
        if (rows.length > 0) {
            console.log('SP Definition:');
            console.log(rows[0]['Create Procedure']);
        } else {
            console.log('❌ SP not found!');
        }
        
        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkUserSP();
