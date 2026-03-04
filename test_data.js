const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

async function test() {
    let connection;
    try {
        console.log('Connecting to DESKTOP-IK6ME8M / breffini-live...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        console.log("Looking for recent student_course entries...");
        const [scRows] = await connection.query(`
            SELECT sc.StudentCourse_ID, sc.Student_ID, s.First_Name as StudentName, sc.Course_ID, c.Course_Name, sc.Batch_ID, sc.Slot_Id, sc.Delete_Status, sc.Expiry_Date
            FROM student_course sc
            LEFT JOIN student s ON s.Student_ID = sc.Student_ID
            LEFT JOIN course c ON c.Course_ID = sc.Course_ID
            ORDER BY sc.StudentCourse_ID DESC
            LIMIT 10
        `);
        console.log(scRows);

        console.log("Looking for recent teacher_time_slot entries...");
        const [ttsRows] = await connection.query(`
            SELECT tts.Slot_Id, tts.CourseTeacher_ID, tts.Batch_ID, tts.start_time, tts.end_time, tts.Delete_Status,
                   ct.Teacher_ID, u.First_Name as TeacherName
            FROM teacher_time_slot tts
            JOIN course_teacher ct ON tts.CourseTeacher_ID = ct.CourseTeacher_ID
            JOIN users u ON u.User_ID = ct.Teacher_ID
            ORDER BY tts.Slot_Id DESC
            LIMIT 10
        `);
        console.log(ttsRows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

test();
