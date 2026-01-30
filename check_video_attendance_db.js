const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    const connection = await mysql.createConnection({
        host: "DESKTOP-IK6ME8M",
        user: "root",
        password: "root",
        database: "breffini-live",
        port: 3306
    });

    try {
        console.log('\n--- Data for Student 337 ---');
        const [data] = await connection.query("SELECT * FROM video_attendance WHERE Student_ID = 337");
        console.log(`Found ${data.length} records:`, data);

        console.log('\n--- Checking SP parameters ---');
        const [params] = await connection.query(`
            SELECT PARAMETER_NAME, DATA_TYPE, PARAMETER_MODE
            FROM information_schema.PARAMETERS
            WHERE SPECIFIC_NAME = 'Get_VideoAttendance'
        `);
        console.log('Get_VideoAttendance Parameters:', params);

        const [saveParams] = await connection.query(`
            SELECT PARAMETER_NAME, DATA_TYPE, PARAMETER_MODE
            FROM information_schema.PARAMETERS
            WHERE SPECIFIC_NAME = 'Save_VideoAttendance'
        `);
        console.log('Save_VideoAttendance Parameters:', saveParams);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

checkDB();
