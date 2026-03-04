const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

async function checkRecent() {
    let connection;
    try {
        console.log('Connecting to DESKTOP-IK6ME8M / breffini-live...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        const [courses] = await connection.query("SELECT Course_ID, Course_Name, Delete_Status FROM course ORDER BY Course_ID DESC LIMIT 3");
        console.log("Recent Courses:", courses);

        const [students] = await connection.query("SELECT Student_ID, First_Name, Delete_Status FROM student ORDER BY Student_ID DESC LIMIT 3");
        console.log("Recent Students:", students);

        const [teachers] = await connection.query("SELECT User_ID, First_Name, Delete_Status FROM users WHERE user_type_id = 2 ORDER BY User_ID DESC LIMIT 3");
        console.log("Recent Teachers:", teachers);

        const [studentCourses] = await connection.query(`
            SELECT sc.StudentCourse_ID, sc.Student_ID, sc.Course_ID, sc.Slot_Id, sc.Batch_ID, sc.Delete_Status
            FROM student_course sc
            ORDER BY sc.StudentCourse_ID DESC LIMIT 5
        `);
        console.log("Recent Student Courses:", studentCourses);

        const [courseTeachers] = await connection.query(`
            SELECT ct.CourseTeacher_ID, ct.Course_ID, ct.Teacher_ID, ct.Delete_Status
            FROM course_teacher ct
            ORDER BY ct.CourseTeacher_ID DESC LIMIT 5
        `);
        console.log("Recent Course Teachers:", courseTeachers);

        const [teacherTimeSlots] = await connection.query(`
            SELECT tts.Slot_Id, tts.CourseTeacher_ID, tts.Batch_ID, tts.Delete_Status
            FROM teacher_time_slot tts
            ORDER BY tts.Slot_Id DESC LIMIT 5
        `);
        console.log("Recent Teacher Time Slots:", teacherTimeSlots);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

checkRecent();
