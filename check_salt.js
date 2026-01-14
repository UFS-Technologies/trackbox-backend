const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'breffini-live'
        });
        const [rows] = await connection.query("SHOW COLUMNS FROM student LIKE 'Salt'");
        const status = rows.length > 0 ? 'Exists' : 'Missing';
        require('fs').writeFileSync('salt_status.txt', status);
        console.log('Salt column status:', status);
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}
check();
