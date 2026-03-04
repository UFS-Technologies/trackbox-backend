const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

const enroleCourseSP = `
CREATE PROCEDURE \`enroleCourse\`(
    IN Student_ID_ int,
    IN Course_ID_ int,
    IN Enrollment_Date_ date,
    IN Price_ int,
    IN Payment_Date_ datetime,
    IN Payment_Status_ varchar(50),
    IN LastAccessed_Content_ID_ VARCHAR(50),
    IN Transaction_Id_ varchar(50),
    IN Delete_Status_ tinyint,
    IN Payment_Method_ varchar(50),
    IN Slot_Id_ int,
    IN Batch_Id_ int,
    IN StudentCourse_ID_ int
)
BEGIN
    DECLARE course_validity INT;
    DECLARE course_expiry_date DATE;
    DECLARE existing_Course_ID INT;
    DECLARE course_Name_ VARCHAR(100);
    DECLARE student_Name_ VARCHAR(100);
    DECLARE course_conflict INT;

    -- Fetch course details
    SELECT Validity, Course_Name, Price INTO course_validity, course_Name_, Price_ FROM course WHERE Course_ID = Course_ID_;
    SELECT First_Name INTO student_Name_ FROM student WHERE Student_ID = Student_ID_;

    -- Check if the course is valid
    IF course_validity IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Course_ID';
    END IF;

    -- Calculate Expiry Date
    SET course_expiry_date = NULL;
    IF Batch_Id_ IS NOT NULL AND Batch_Id_ > 0 THEN
        SELECT End_Date INTO course_expiry_date
        FROM course_batch
        WHERE Batch_ID = Batch_Id_;
    END IF;

    IF course_expiry_date IS NULL THEN
        SET course_expiry_date = DATE_ADD(Enrollment_Date_, INTERVAL course_validity DAY);
    END IF;

    -- Check if the StudentCourse_ID is provided for update
    IF StudentCourse_ID_ > 0 THEN
        UPDATE student_course
        SET 
            Course_ID = Course_ID_,
            Enrollment_Date = Enrollment_Date_,
            Expiry_Date = course_expiry_date,
            Price = Price_,
            Payment_Date = Payment_Date_,
            Payment_Status = Payment_Status_,
            LastAccessed_Content_ID = LastAccessed_Content_ID_,
            Transaction_Id = Transaction_Id_,
            Delete_Status = Delete_Status_,
            Payment_Method = Payment_Method_,
            Slot_Id = Slot_Id_,
            Requested_Slot_Id = Slot_Id_,
            Batch_ID = Batch_Id_
        WHERE 
            StudentCourse_ID = StudentCourse_ID_;
    ELSE
        -- Insert path
        INSERT INTO data_log VALUES (45682, Batch_Id_);

        -- Check for Course conflicts
        SELECT COUNT(*) INTO course_conflict 
        FROM student_course 
        WHERE Course_ID = Course_ID_ AND Student_ID = Student_ID_ AND Delete_Status = 0 AND Expiry_Date >= CURDATE();

        IF course_conflict > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student is already enrolled in this course'; 
        ELSE 
            INSERT INTO student_course (
                Student_ID, 
                Course_ID, 
                Enrollment_Date, 
                Expiry_Date, 
                Price, 
                Payment_Date, 
                Payment_Status, 
                LastAccessed_Content_ID, 
                Transaction_Id, 
                Delete_Status, 
                Payment_Method,
                Slot_Id,
                Requested_Slot_Id,
                Batch_ID
            ) VALUES (
                Student_ID_, 
                Course_ID_, 
                Enrollment_Date_, 
                course_expiry_date, 
                Price_, 
                Payment_Date_, 
                Payment_Status_, 
                LastAccessed_Content_ID_, 
                Transaction_Id_, 
                Delete_Status_, 
                Payment_Method_,
                Slot_Id_, 
                Slot_Id_,
                Batch_Id_
            );
        END IF;
    END IF;

    -- Return the details
    SELECT Course_ID_, Student_ID_, course_Name_, student_Name_;
END
`;

const enroleCourseFromAdminSP = `
CREATE PROCEDURE \`enroleCourseFromAdmin\`(
    IN Student_ID_ int,
    IN Course_ID_ int,
    IN Enrollment_Date_ date,
    IN Price_ int,
    IN Payment_Date_ datetime,
    IN Payment_Status_ varchar(50),
    IN LastAccessed_Content_ID_ VARCHAR(50),
    IN Transaction_Id_ varchar(50),
    IN Delete_Status_ tinyint,
    IN Payment_Method_ varchar(50),
    IN Slot_Id_ int,
    IN Batch_Id_ int,
    IN StudentCourse_ID_ int
)
BEGIN
    DECLARE course_validity INT;
    DECLARE course_expiry_date DATE;
    DECLARE existing_Course_ID INT;
    DECLARE course_Name_ VARCHAR(100);
    DECLARE student_Name_ VARCHAR(100);
    DECLARE course_conflict INT;

    -- Fetch course details
    SELECT Validity, Course_Name INTO course_validity, course_Name_ FROM course WHERE Course_ID = Course_ID_;
    SELECT First_Name INTO student_Name_ FROM student WHERE Student_ID = Student_ID_;

    -- Check if the course is valid
    IF course_validity IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Course_ID';
    END IF;

    -- Calculate Expiry Date
    SET course_expiry_date = NULL;
    IF Batch_Id_ IS NOT NULL AND Batch_Id_ > 0 THEN
        SELECT End_Date INTO course_expiry_date
        FROM course_batch
        WHERE Batch_ID = Batch_Id_;
    END IF;

    IF course_expiry_date IS NULL THEN
        SET course_expiry_date = DATE_ADD(Enrollment_Date_, INTERVAL course_validity DAY);
    END IF;

    -- Check if the StudentCourse_ID is provided for update
    IF StudentCourse_ID_ > 0 THEN
        UPDATE student_course
        SET 
            Course_ID = Course_ID_,
            Enrollment_Date = Enrollment_Date_,
            Expiry_Date = course_expiry_date,
            Price = Price_,
            Payment_Date = Payment_Date_,
            Payment_Status = Payment_Status_,
            LastAccessed_Content_ID = LastAccessed_Content_ID_,
            Transaction_Id = Transaction_Id_,
            Delete_Status = Delete_Status_,
            Payment_Method = 'ADMIN',
            Slot_Id = Slot_Id_,
            Requested_Slot_Id = Slot_Id_,
            Batch_ID = Batch_Id_
        WHERE 
            StudentCourse_ID = StudentCourse_ID_;
    ELSE
        -- Insert path
        INSERT INTO data_log VALUES (45682, Batch_Id_);

        -- Check for Course conflicts
        SELECT COUNT(*) INTO course_conflict 
        FROM student_course 
        WHERE Course_ID = Course_ID_ AND Student_ID = Student_ID_ AND Delete_Status = 0 AND Expiry_Date >= CURDATE();

        IF course_conflict > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student is already enrolled in this course'; 
        ELSE 
            INSERT INTO student_course (
                Student_ID, 
                Course_ID, 
                Enrollment_Date, 
                Expiry_Date, 
                Price, 
                Payment_Date, 
                Payment_Status, 
                LastAccessed_Content_ID, 
                Transaction_Id, 
                Delete_Status, 
                Payment_Method,
                Slot_Id,
                Requested_Slot_Id,
                Batch_ID
            ) VALUES (
                Student_ID_, 
                Course_ID_, 
                Enrollment_Date_, 
                course_expiry_date, 
                Price_, 
                Payment_Date_, 
                Payment_Status_, 
                LastAccessed_Content_ID_, 
                Transaction_Id_, 
                Delete_Status_, 
                'ADMIN',
                Slot_Id_, 
                Slot_Id_,
                Batch_Id_
            );
        END IF;
    END IF;

    -- Return the details
    SELECT Course_ID_, Student_ID_, course_Name_, student_Name_;
END
`;

async function apply() {
    let connection;
    try {
        console.log('Connecting to DESKTOP-IK6ME8M / breffini-live...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        console.log('Updating enroleCourse...');
        await connection.query("DROP PROCEDURE IF EXISTS `enroleCourse`;");
        await connection.query(enroleCourseSP);
        console.log('enroleCourse updated.');

        console.log('Updating enroleCourseFromAdmin...');
        await connection.query("DROP PROCEDURE IF EXISTS `enroleCourseFromAdmin`;");
        await connection.query(enroleCourseFromAdminSP);
        console.log('enroleCourseFromAdmin updated.');

        console.log('All updates applied successfully to the database.');
    } catch (err) {
        console.error('Error applying updates:', err);
    } finally {
        if (connection) await connection.end();
    }
}

apply();
