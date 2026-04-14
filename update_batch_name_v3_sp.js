
const mysql = require('mysql2/promise');

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

        const sql = `
DROP PROCEDURE IF EXISTS Get_Teacher_courses_With_Batch;

CREATE PROCEDURE Get_Teacher_courses_With_Batch(IN user_Id_ INT)
BEGIN 
  SELECT 
    MIN(CourseTeacher_ID) as CourseTeacher_ID,
    Course_ID,  
    Course_Name,
    Batch_Name
  FROM (
      SELECT 
        ct.CourseTeacher_ID, 
        ct.Course_ID,  
        c.Course_Name,
        COALESCE(b.Batch_Name, (
            SELECT GROUP_CONCAT(DISTINCT cb2.Batch_Name SEPARATOR ', ')
            FROM student_course sc 
            JOIN course_batch cb2 ON sc.Batch_ID = cb2.Batch_ID
            WHERE sc.Slot_Id = tts.Slot_Id 
            AND sc.Course_ID = ct.Course_ID
            AND sc.Delete_Status = FALSE 
            AND sc.Expiry_Date > CURDATE() 
            AND cb2.Delete_Status = FALSE
        )) as Batch_Name
    FROM 
        course_teacher ct 
        INNER JOIN teacher_time_slot tts 
            ON tts.CourseTeacher_ID = ct.CourseTeacher_ID
        INNER JOIN course c 
            ON ct.Course_ID = c.Course_ID
        LEFT JOIN course_batch b 
            ON tts.Batch_ID = b.Batch_ID
    WHERE 
        ct.Teacher_ID = user_Id_
        AND ct.Delete_Status = FALSE 
        AND tts.Delete_Status = FALSE 
        AND c.Delete_Status = FALSE 
        AND (b.Batch_ID IS NULL OR b.Delete_Status = FALSE)
  ) as sub
  GROUP BY 
    Course_ID, 
    Course_Name,
    Batch_Name
  ORDER BY Course_Name;
END;
`;

        await connection.query(sql);
        console.log('Successfully updated Get_Teacher_courses_With_Batch stored procedure (Deduplicated Version)');

        await connection.end();
    } catch (err) {
        console.error('Error updating SP:', err);
        process.exit(1);
    }
}

updateSP();
