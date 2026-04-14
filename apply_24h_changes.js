const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyChanges() {
    const config = {
        host: "DESKTOP-IK6ME8M",
        user: 'root',
        password: 'root',
        database: "breffini-live",
        port: 3306,
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, 'enable_24h_faculty.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying SQL changes...');
        await connection.query(sql);
        console.log('Successfully updated teacher_time_slot records and ValidateTimeSlots procedure');

        await connection.end();
    } catch (err) {
        console.error('Error applying changes:', err);
        process.exit(1);
    }
}

applyChanges();
