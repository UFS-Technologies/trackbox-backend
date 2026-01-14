const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'breffini-live'
};

async function checkSchema() {
    let output = '';
    const log = (str) => { output += str + '\n'; console.log(str); };
    let connection;
    try {
        console.log('Connecting...');
        connection = await mysql.createConnection(dbConfig);
        log('--- Student Table Schema ---');
        const [rows] = await connection.execute('DESCRIBE student');
        // Simple table format
        rows.forEach(r => log(`${r.Field}\t${r.Type}\t${r.Null}\t${r.Key}\t${r.Default}\t${r.Extra}`));

        log('\n--- Save_student SP Definition ---');
        const [spRows] = await connection.execute('SHOW CREATE PROCEDURE Save_student');
        log(spRows[0]['Create Procedure']);

        log('\n--- Login_Check SP Definition ---');
        const [loginSpRows] = await connection.execute('SHOW CREATE PROCEDURE Login_Check');
        log(loginSpRows[0]['Create Procedure']);

        fs.writeFileSync('schema_output.txt', output);
        console.log('Done writing schema_output.txt');

    } catch (error) {
        console.error('Error:', error.message);
        fs.writeFileSync('schema_output.txt', 'Error: ' + error.message);
    } finally {
        if(connection) await connection.end();
        process.exit();
    }
}

checkSchema();
