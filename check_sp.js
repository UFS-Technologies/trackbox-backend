const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // Get the current SP definition from the database
        const [rows] = await connection.query("SHOW CREATE PROCEDURE `Get_Teacher_Students`");
        if (rows.length > 0) {
            console.log("\n=== Current SP in DB ===\n");
            console.log(rows[0]['Create Procedure']);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

check();
