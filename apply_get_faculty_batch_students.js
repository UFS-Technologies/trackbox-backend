const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

const spSQL = `
CREATE PROCEDURE \`Get_Faculty_Batch_Students\`(
    IN teacher_id_ INT
)
BEGIN
    SELECT DISTINCT
        cb.Batch_ID,
        cb.Batch_Name,
        cb.Start_Date,
        cb.End_Date,
        c.Course_ID,
        c.Course_Name,
        sc.Student_ID,
        s.First_Name,
        s.Last_Name,
        s.Email,
        s.Phone_Number,
        s.Profile_Photo_Path,
        sc.Enrollment_Date,
        sc.Expiry_Date,
        sc.Payment_Status
    FROM 
        course_teacher ct
    INNER JOIN course c 
        ON c.Course_ID = ct.Course_ID
    INNER JOIN course_batch cb 
        ON cb.Course_ID = ct.Course_ID
    INNER JOIN student_course sc 
        ON sc.Batch_ID = cb.Batch_ID 
        AND sc.Course_ID = ct.Course_ID
    INNER JOIN student s 
        ON s.Student_ID = sc.Student_ID
    WHERE 
        ct.Teacher_ID = teacher_id_
        AND ct.Delete_Status = FALSE
        AND cb.Delete_Status = FALSE
        AND c.Delete_Status = FALSE
        AND sc.Delete_Status = FALSE
        AND s.Delete_Status = FALSE
        AND sc.Expiry_Date > CURDATE()
    ORDER BY 
        cb.Batch_Name, s.First_Name, s.Last_Name;
END
`;

async function apply() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        console.log('Dropping existing Get_Faculty_Batch_Students...');
        await connection.query("DROP PROCEDURE IF EXISTS `Get_Faculty_Batch_Students`;");

        console.log('Creating updated Get_Faculty_Batch_Students stored procedure...');
        await connection.query(spSQL);
        console.log('Get_Faculty_Batch_Students created successfully.');

        console.log('Done!');
    } catch (err) {
        console.error('Error applying stored procedure:', err);
    } finally {
        if (connection) await connection.end();
    }
}

apply();
