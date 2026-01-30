const mysql = require('mysql2/promise');

async function applySP() {
    const connection = await mysql.createConnection({
        host: "DESKTOP-IK6ME8M",
        user: "root",
        password: "root",
        database: "breffini-live",
        port: 3306,
        multipleStatements: true
    });

    const spSql = `
DROP PROCEDURE IF EXISTS \`Get_VideoAttendance\`;

CREATE PROCEDURE \`Get_VideoAttendance\`(
    IN p_Student_ID INT,
    IN p_Course_ID INT,
    IN p_Content_ID INT,
    IN p_Month VARCHAR(10) -- YYYY-MM format
)
BEGIN
    SELECT 
        va.VideoAttendance_ID,
        va.Student_ID,
        va.Course_ID,
        va.Content_ID,
        va.Watched_Date,
        va.Update_Time,
        c.Course_Name,
        cc.Content_Name as Content_Name
    FROM video_attendance va
    JOIN course c ON va.Course_ID = c.Course_ID
    JOIN course_content cc ON va.Content_ID = cc.Content_ID
    WHERE (p_Student_ID = 0 OR va.Student_ID = p_Student_ID)
      AND (p_Course_ID = 0 OR va.Course_ID = p_Course_ID)
      AND (p_Content_ID = 0 OR va.Content_ID = p_Content_ID)
      AND (p_Month IS NULL OR p_Month = '' OR DATE_FORMAT(va.Watched_Date, '%Y-%m') = p_Month)
      AND va.Delete_Status = 0
    ORDER BY va.Update_Time DESC;
END;
`;

    try {
        await connection.query(spSql);
        console.log('Successfully updated Get_VideoAttendance SP');
    } catch (e) {
        console.error('Failed to update SP:', e.message);
    } finally {
        await connection.end();
    }
}

applySP();
