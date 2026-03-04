const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

const getTeacherStudentsSP = `
CREATE PROCEDURE \`Get_Teacher_Students\`(
    IN user_id_ INT,
    IN course_id_ INT
)
BEGIN 
    SELECT DISTINCT
        sc.StudentCourse_ID,
        sc.Student_ID,
        sc.Course_ID,
        c.Course_Name,
        s.First_Name,
        s.Last_Name,
        sc.Enrollment_Date,
        sc.Expiry_Date,
        sc.Price,
        sc.Payment_Date,
        sc.Payment_Status,
        sc.LastAccessed_Content_ID,
        sc.Transaction_Id,
        sc.Delete_Status,
        sc.Payment_Method,
        cb.Batch_Name,
        tts.start_time,
        tts.end_time
    FROM 
        course_teacher ct
    JOIN users u ON u.User_ID = ct.Teacher_ID
    JOIN teacher_time_slot tts ON tts.CourseTeacher_ID = ct.CourseTeacher_ID
    JOIN student_course sc ON sc.Slot_Id = tts.Slot_Id
    JOIN course c ON c.Course_ID = sc.Course_ID
    LEFT JOIN course_batch cb ON cb.Batch_ID = sc.Batch_ID
    JOIN student s ON sc.Student_ID = s.Student_ID
    WHERE 
        u.User_ID = user_id_
        AND sc.Expiry_Date > CURDATE()
        AND sc.Delete_Status = FALSE 
        AND s.Delete_Status = FALSE
        AND ct.Delete_Status = FALSE 
        AND tts.Delete_Status = FALSE
        AND c.Delete_Status = FALSE
        AND (course_id_ = 0 OR sc.Course_ID = course_id_)

    UNION

    SELECT DISTINCT
        sc.StudentCourse_ID,
        sc.Student_ID,
        sc.Course_ID,
        c.Course_Name,
        s.First_Name,
        s.Last_Name,
        sc.Enrollment_Date,
        sc.Expiry_Date,
        sc.Price,
        sc.Payment_Date,
        sc.Payment_Status,
        sc.LastAccessed_Content_ID,
        sc.Transaction_Id,
        sc.Delete_Status,
        sc.Payment_Method,
        cb.Batch_Name,
        tts.start_time,
        tts.end_time
    FROM 
        course_teacher ct
    JOIN users u ON u.User_ID = ct.Teacher_ID
    JOIN teacher_time_slot tts ON tts.CourseTeacher_ID = ct.CourseTeacher_ID
    JOIN course_batch cb ON cb.Course_ID = ct.Course_ID AND cb.Delete_Status = FALSE
    JOIN student_course sc ON sc.Batch_ID = cb.Batch_ID AND sc.Course_ID = ct.Course_ID
    JOIN course c ON c.Course_ID = sc.Course_ID
    JOIN student s ON sc.Student_ID = s.Student_ID
    WHERE 
        u.User_ID = user_id_
        AND sc.Expiry_Date > CURDATE()
        AND sc.Delete_Status = FALSE 
        AND s.Delete_Status = FALSE
        AND ct.Delete_Status = FALSE 
        AND tts.Delete_Status = FALSE
        AND c.Delete_Status = FALSE
        AND (course_id_ = 0 OR sc.Course_ID = course_id_);
END
`;

async function apply() {
    let connection;
    try {
        console.log('Connecting to DESKTOP-IK6ME8M / breffini-live...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        console.log('Updating Get_Teacher_Students...');
        await connection.query("DROP PROCEDURE IF EXISTS `Get_Teacher_Students`;");
        await connection.query(getTeacherStudentsSP);
        console.log('Get_Teacher_Students updated.');

        console.log('Updates applied successfully to the database.');
    } catch (err) {
        console.error('Error applying updates:', err);
    } finally {
        if (connection) await connection.end();
    }
}

apply();
