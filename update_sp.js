
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateSP() {
    const config = {
        host: 'DESKTOP-IK6ME8M',
        user: 'root',
        password: 'root',
        database: 'breffini-live',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, 'get_video_attendance.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await connection.query(sql);
        console.log('Successfully updated Get_VideoAttendance stored procedure');

        await connection.end();
    } catch (err) {
        console.error('Error updating SP:', err);
        process.exit(1);
    }
}

updateSP();
