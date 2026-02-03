const mysql = require('mysql2/promise');
require('dotenv').config();

async function applySP() {
    // Existing config from apply_video_attendance_sp.js seems to be hardcoded, 
    // but I should try to use environment variables or stay consistent.
    // I'll use the hardcoded values as a fallback if process.env.DB_HOST is missing.
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "DESKTOP-IK6ME8M",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "breffini-live",
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });

    const spSql = `
DROP PROCEDURE IF EXISTS \`Get_BatchAttendanceAvg\`;

CREATE PROCEDURE \`Get_BatchAttendanceAvg\`()
BEGIN
    SELECT 
        IFNULL(AVG(batch_attendance_rate), 0) as average_attendance_rate
    FROM (
        SELECT 
            b.Batch_ID,
            COUNT(DISTINCT sc.Student_ID) as total_students,
            COUNT(DISTINCT va.Student_ID) as attended_students,
            IF(COUNT(DISTINCT sc.Student_ID) > 0, 
               (COUNT(DISTINCT va.Student_ID) / COUNT(DISTINCT sc.Student_ID)) * 100, 
               0) as batch_attendance_rate
        FROM course_batch b
        LEFT JOIN student_course sc ON b.Batch_ID = sc.Batch_ID AND sc.Delete_Status = 0
        LEFT JOIN video_attendance va ON sc.Student_ID = va.Student_ID 
             AND DATE(va.Watched_Date) = CURDATE() 
             AND va.Delete_Status = 0
        WHERE b.Delete_Status = 0
        GROUP BY b.Batch_ID
        HAVING total_students > 0
    ) batch_rates;
END;
`;

    try {
        await connection.query(spSql);
        console.log('Successfully created Get_BatchAttendanceAvg SP');
    } catch (e) {
        console.error('Failed to create SP:', e.message);
    } finally {
        await connection.end();
    }
}

applySP();
