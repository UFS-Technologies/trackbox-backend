const mysql = require('mysql2/promise');

async function verify() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'breffini-live'
    });

    console.log('--- Table: student ---');
    const [cols] = await connection.query('DESCRIBE student');
    console.table(cols);

    console.log('\n--- SP: Get_Student_Login_Details ---');
    try {
        const [sp] = await connection.query('SHOW CREATE PROCEDURE Get_Student_Login_Details');
        console.log(sp[0]['Create Procedure']);
    } catch (e) {
        console.error('SP Get_Student_Login_Details not found:', e.message);
    }

    console.log('\n--- SP: Save_student ---');
    try {
        const [sp] = await connection.query('SHOW CREATE PROCEDURE Save_student');
        console.log(sp[0]['Create Procedure']);
    } catch (e) {
        console.error('SP Save_student not found:', e.message);
    }

    await connection.end();
}

verify();
