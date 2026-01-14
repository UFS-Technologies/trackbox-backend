const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'breffini-live',
};

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [tables] = await connection.query("SHOW TABLES LIKE 'Teacher%'");
        console.log('Tables found:', tables.map(t => Object.values(t)[0]));

        const [procs] = await connection.query("SHOW PROCEDURE STATUS WHERE Db = 'breffini-live' AND Name LIKE 'Save_Teacher_%' OR Name LIKE 'Get_Teacher_%'");
        console.log('Procedures found:', procs.map(p => p.Name));

        if (tables.length >= 2 && procs.length >= 4) {
            console.log('Verification successful: Tables and procedures exist.');
        } else {
            console.log('Verification failed: Some items are missing.');
        }
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
