const mysql = require('mysql2/promise');

async function listSPs() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        
        console.log('✅ Connected');
        
        const [rows] = await connection.query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'breffini-live' AND ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME = 'check_User'");
        
        for (const row of rows) {
            console.log(`--- PROCEDURE: ${row.ROUTINE_NAME} ---`);
            const [createRows] = await connection.query(`SHOW CREATE PROCEDURE ${row.ROUTINE_NAME}`);
            console.log(createRows[0]['Create Procedure']);
        }
        
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

listSPs();
