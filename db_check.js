const mysql = require('mysql2/promise');
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'breffini-live'
};
async function check() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT 1');
        console.log('DB Check:', rows);
        const [sp] = await connection.query("SHOW PROCEDURE STATUS WHERE Name = 'enroleCourseFromAdmin'");
        console.log('SP Check:', sp);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}
check();
