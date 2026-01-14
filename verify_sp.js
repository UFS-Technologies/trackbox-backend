const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'breffini-live',
    multipleStatements: true
};

const logFile = path.join(__dirname, 'verify_sp_log.txt');
function log(msg) {
    console.log(msg);
    try { fs.appendFileSync(logFile, msg + '\n'); } catch (e) {}
}

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query("SHOW CREATE PROCEDURE Save_student");
        log('Save_student Definition:');
        log(rows[0]['Create Procedure']);
    } catch (err) {
        log('Error: ' + err.message);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
