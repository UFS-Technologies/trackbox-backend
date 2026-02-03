const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAPI() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "DESKTOP-IK6ME8M",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "breffini-live",
        port: parseInt(process.env.DB_PORT) || 3306
    });

    try {
        console.log('Testing Get_BatchAttendanceAvg SP...');
        const [rows] = await connection.query('CALL Get_BatchAttendanceAvg()');
        console.log('Result:', rows[0][0]);

        if (rows[0][0] && typeof rows[0][0].average_attendance_rate !== 'undefined') {
            console.log('✅ Success: API returns valid attendance rate.');
        } else {
            console.log('❌ Failure: API returned unexpected data structure.');
        }
    } catch (e) {
        console.error('❌ Error during test:', e.message);
    } finally {
        await connection.end();
    }
}

testAPI();
