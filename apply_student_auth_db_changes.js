const mysql = require('mysql2/promise');

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'db_apply_log.txt');

function log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync(logFile, msg + '\n');
    } catch (e) {
        // ignore
    }
}

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'breffini-live',
    multipleStatements: true
};

async function applyChanges() {
    let connection;
    try {
        log('Starting database connection...');
        connection = await mysql.createConnection(dbConfig);
        log('Connected to database.');

        // 1. Add Password and Salt columns to student table
        log('Checking student table columns...');
        const [passCols] = await connection.query("SHOW COLUMNS FROM student LIKE 'Password'");
        if (passCols.length === 0) {
            log('Adding Password column to student table...');
            await connection.query("ALTER TABLE student ADD COLUMN Password VARCHAR(255) DEFAULT NULL");
            log('Password column added.');
        } else {
            log('Password column already exists.');
        }

        const [saltCols] = await connection.query("SHOW COLUMNS FROM student LIKE 'Salt'");
        if (saltCols.length === 0) {
            log('Adding Salt column to student table...');
            await connection.query("ALTER TABLE student ADD COLUMN Salt VARCHAR(255) DEFAULT NULL");
            log('Salt column added.');
        } else {
            log('Salt column already exists.');
        }

        // 2. Drop and Recreate Save_student SP
        log('Updating Save_student stored procedure...');
        const dropSaveStudent = "DROP PROCEDURE IF EXISTS `Save_student`";
        const createSaveStudent = `
CREATE DEFINER=\`root\`@\`%\` PROCEDURE \`Save_student\`( 
    IN Student_ID_ INT,
    IN First_Name_ VARCHAR(50),
    IN Last_Name_ VARCHAR(100),
    IN Email_ VARCHAR(100),
    IN Phone_Number_ VARCHAR(50),
    IN Social_Provider_ VARCHAR(50),
    IN Social_ID_ VARCHAR(100),
    IN Delete_Status_ TINYINT,
    IN Profile_Photo_Name_ LONGTEXT,
    IN Profile_Photo_Path_ LONGTEXT,
    IN Avatar_ VARCHAR(40),
    IN Country_Code_ VARCHAR(45),
    IN Country_Code_Name_ VARCHAR(45),
    IN Password_ VARCHAR(255),
    IN Salt_ VARCHAR(255)
)
BEGIN 
    DECLARE existing_student_id INT;
    DECLARE existing_user_id INT;

    -- Check if email exists in the users table (case-insensitive)
    IF Email_ != '' AND EXISTS (SELECT 1 FROM users WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 LIMIT 1) THEN
        SELECT User_ID INTO existing_user_id
        FROM users
        WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 LIMIT 1;
    END IF;

    -- If email exists in the users table, return User_ID
    IF existing_user_id IS NOT NULL THEN
        SELECT existing_user_id AS User_ID, 'User' AS Source, 1 AS existingUser;
    ELSE
        -- If updating a student
        IF Student_ID_ > 0 THEN 
            -- Check if another student exists with the same Email or Phone_Number (with country code) and a different Student_ID (case-insensitive)
            IF Email_ != '' AND EXISTS (SELECT 1 FROM student WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 AND Student_ID != Student_ID_ LIMIT 1) THEN
                SELECT Student_ID INTO existing_student_id
                FROM student
                WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 AND Student_ID != Student_ID_ LIMIT 1;
            
            ELSEIF Phone_Number_ != '' AND EXISTS (SELECT 1 FROM student WHERE Phone_Number = Phone_Number_ AND Country_Code = Country_Code_ AND Delete_Status = 0 AND Student_ID != Student_ID_ LIMIT 1) THEN
                SELECT Student_ID INTO existing_student_id
                FROM student
                WHERE Phone_Number = Phone_Number_ AND Country_Code = Country_Code_ AND Delete_Status = 0 AND Student_ID != Student_ID_ LIMIT 1;
            END IF;

            -- If an existing student with the same email or phone number is found, return it
            IF existing_student_id IS NOT NULL THEN
                SELECT existing_student_id AS Student_ID, 'Student' AS Source, 1 AS existingUser;
            ELSE
                -- Update current student details
                UPDATE student 
                SET First_Name = First_Name_,
                    Last_Name = Last_Name_,
                    Email = Email_,
                    Phone_Number = Phone_Number_,
                    Social_Provider = Social_Provider_,
                    Social_ID = Social_ID_,
                    Profile_Photo_Name = Profile_Photo_Name_,
                    Profile_Photo_Path = Profile_Photo_Path_,
                    Delete_Status = Delete_Status_,
                    Avatar = Avatar_,
                    Country_Code = Country_Code_,
                    Country_Code_Name = Country_Code_Name_,
                    Password = Password_,
                    Salt = Salt_
                WHERE Student_ID = Student_ID_;
            END IF;
        
        ELSE
            -- Insert new student if Email or Phone_Number (with country code) does not exist (case-insensitive)
            IF Email_ != '' AND EXISTS (SELECT 1 FROM student WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 LIMIT 1) THEN
                SELECT Student_ID INTO existing_student_id
                FROM student
                WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0 LIMIT 1;
            
            ELSEIF Phone_Number_ != '' AND EXISTS (SELECT 1 FROM student WHERE Phone_Number = Phone_Number_ AND Country_Code = Country_Code_ AND Delete_Status = 0 LIMIT 1) THEN
                SELECT Student_ID INTO existing_student_id
                FROM student
                WHERE Phone_Number = Phone_Number_ AND Country_Code = Country_Code_ AND Delete_Status = 0 LIMIT 1;
            END IF;

            -- If existing student is found, return it
            IF existing_student_id IS NOT NULL THEN
                SELECT existing_student_id AS Student_ID, 'Student' AS Source, 1 AS existingUser;
            ELSE
                -- Insert new student
                INSERT INTO student (First_Name, Last_Name, Email, Phone_Number, Social_Provider, Social_ID, Delete_Status, Profile_Photo_Name, Profile_Photo_Path, Avatar, Country_Code, Country_Code_Name, Password, Salt)
                VALUES (First_Name_, Last_Name_, Email_, Phone_Number_, Social_Provider_, Social_ID_, Delete_Status_, Profile_Photo_Name_, Profile_Photo_Path_, Avatar_, Country_Code_, Country_Code_Name_, Password_, Salt_);
                
                -- Set the new student ID
                SET Student_ID_ = LAST_INSERT_ID();
            END IF;
        END IF;

        -- Return the Student ID and flag for existing user
        SELECT Student_ID_ AS Student_ID, 'Student' AS Source, 0 AS existingUser;
    END IF;
END
`;
        await connection.query(dropSaveStudent);
        await connection.query(createSaveStudent);
        log('Save_student SP updated.');

        // 3. Create Get_Student_Login_Details SP
        log('Creating Get_Student_Login_Details stored procedure...');
        const dropGetStudentLogin = "DROP PROCEDURE IF EXISTS `Get_Student_Login_Details`";
        const createGetStudentLogin = `
CREATE PROCEDURE \`Get_Student_Login_Details\`(
    IN Email_ VARCHAR(100)
)
BEGIN
    SELECT Student_ID, First_Name, Last_Name, Email, Phone_Number, Password, Salt, Delete_Status, Device_ID
    FROM student
    WHERE Email = Email_ AND Delete_Status = 0;
END
`;
        await connection.query(dropGetStudentLogin);
        await connection.query(createGetStudentLogin);
        log('Get_Student_Login_Details SP created.');

        log('All database changes applied successfully.');

    } catch (err) {
        log('Error applying changes: ' + err);
        console.error('Error applying changes:', err);
    } finally {
        if (connection) await connection.end();
    }
}

applyChanges();
