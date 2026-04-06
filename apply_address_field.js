
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyChanges() {
    const config = {
        host: "DESKTOP-IK6ME8M",
        user: 'root',
        password: 'root',
        database: "breffini-live",
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // 1. Add Address column if it doesn't exist
        try {
            await connection.query("ALTER TABLE users ADD COLUMN Address TEXT AFTER PhoneNumber;");
            console.log('Successfully added Address column to users table');
        } catch (err) {
            if (err.errno === 1060 || err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
                console.log('Address column already exists');
            } else {
                console.error('Error adding column:', err);
                // Continue anyway to try updating SP
            }
        }

        // 2. Update Save_User SP
        const saveUserSP = `
DROP PROCEDURE IF EXISTS Save_User;
CREATE PROCEDURE Save_User(
   IN User_ID_ INT,
    IN First_Name_ VARCHAR(50),
    IN Last_Name_ VARCHAR(100),
    IN Email_ VARCHAR(100),
    IN PhoneNumber_ VARCHAR(50),
    IN Delete_Status_ TINYINT,
    IN User_Type_Id_ INT,
    IN User_Role_Id_ INT,
    IN User_Status_ VARCHAR(50),
    IN password_ VARCHAR(50),
    IN Device_ID_ LONGTEXT,
    IN Profile_Photo_Name_ LONGTEXT,
    IN Profile_Photo_Path_ LONGTEXT,
    IN Course_IDs_ JSON,  -- JSON array of course IDs
    IN Hod_ BOOLEAN,
	IN teacherCourses JSON,
    IN Registered_Date_ LONGTEXT,
    IN Address_ TEXT

)
BEGIN
    DECLARE emailExists INT;
    DECLARE phoneExists INT;
    DECLARE emailExistsInStudent INT;
    DECLARE courseIndex INT DEFAULT 0;
    DECLARE HodtotalCourses INT;

    DECLARE temp_start_time VARCHAR(20);
	DECLARE temp_end_time VARCHAR(20);
    
    DECLARE v_TimeSlotcourseIndex INT DEFAULT 0;
    DECLARE v_totalCourses INT;
    DECLARE v_totalSlots INT;
    DECLARE v_slotIndex INT;
    DECLARE v_course JSON;
    DECLARE v_courseTeacher_ID INT;
    DECLARE v_Course_ID INT;
    DECLARE v_Delete_Status TINYINT;
    DECLARE v_slot JSON;
    DECLARE v_Slot_Id INT;
    DECLARE v_start_time VARCHAR(50);
    DECLARE v_end_time VARCHAR(50);
    DECLARE v_Batch_ID INT;
    
    SELECT COUNT(*)
    INTO emailExists
    FROM users
    WHERE LOWER(Email) = LOWER(Email_) AND User_ID <> User_ID_ AND Delete_Status = 0;

    SELECT COUNT(*)
    INTO phoneExists
    FROM users
    WHERE PhoneNumber = PhoneNumber_ AND User_ID <> User_ID_ AND Delete_Status = 0;

    SELECT COUNT(*)
    INTO emailExistsInStudent
    FROM student
    WHERE LOWER(Email) = LOWER(Email_) AND Delete_Status = 0;

    IF emailExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already exists in users';
    ELSEIF phoneExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phone number already exists in users';
    ELSEIF emailExistsInStudent > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already exists in students';
    ELSE
        IF User_ID_ > 0 THEN
            UPDATE users
            SET First_Name = First_Name_,
                Last_Name = Last_Name_,
                Email = Email_,
                PhoneNumber = PhoneNumber_,
                Delete_Status = Delete_Status_,
                User_Type_Id = User_Type_Id_,
                User_Role_Id = User_Role_Id_,
                Device_ID = Device_ID_,
                Profile_Photo_Name = Profile_Photo_Name_,
                Profile_Photo_Path = Profile_Photo_Path_,
                password = password_,
                Registered_Date = Registered_Date_,
                Address = Address_
            WHERE User_ID = User_ID_;
        ELSE
            INSERT INTO users (First_Name, Last_Name, Email, PhoneNumber, Delete_Status, User_Type_Id, User_Role_Id, password, Profile_Photo_Name, Profile_Photo_Path, Device_ID, Registered_Date, Address)
            VALUES (First_Name_, Last_Name_, Email_, PhoneNumber_, Delete_Status_, User_Type_Id_, User_Role_Id_, password_, Profile_Photo_Name_, Profile_Photo_Path_, Device_ID_, Registered_Date_, Address_);
            SET User_ID_ = LAST_INSERT_ID();
        END IF;

        IF User_Type_Id_ = 2 THEN
            DELETE FROM course_hod WHERE User_ID = User_ID_;
            
            SET v_totalCourses = JSON_LENGTH(teacherCourses);
            WHILE v_TimeSlotcourseIndex < v_totalCourses DO
                SET v_course = JSON_EXTRACT(teacherCourses, CONCAT('$[', v_TimeSlotcourseIndex, ']'));

                SET v_CourseTeacher_ID = JSON_UNQUOTE(JSON_EXTRACT(v_course, '$.CourseTeacher_ID'));
                SET v_Course_ID = JSON_UNQUOTE(JSON_EXTRACT(v_course, '$.Course_ID'));
                SET v_Delete_Status = JSON_UNQUOTE(JSON_EXTRACT(v_course, '$.Delete_Status'));

                IF v_CourseTeacher_ID IS NULL or v_CourseTeacher_ID <= 0 THEN
                    INSERT INTO course_teacher (Course_ID, Teacher_ID, Delete_Status)
                    VALUES (v_Course_ID, User_ID_, v_Delete_Status);
                    SET v_CourseTeacher_ID = LAST_INSERT_ID();
                ELSE
                    UPDATE course_teacher
                    SET Course_ID = v_Course_ID,
                        Teacher_ID = User_ID_,
                        Delete_Status = v_Delete_Status
                    WHERE CourseTeacher_ID = v_CourseTeacher_ID;
                END IF;

                SET v_totalSlots = JSON_LENGTH(JSON_EXTRACT(v_course, '$.timeSlots'));
                SET v_slotIndex = 0;

                WHILE v_slotIndex < v_totalSlots DO
                    SET v_slot = JSON_EXTRACT(v_course, CONCAT('$.timeSlots[', v_slotIndex, ']'));
                    SET v_Slot_Id = JSON_UNQUOTE(JSON_EXTRACT(v_slot, '$.Slot_Id'));
                    SET temp_start_time = JSON_UNQUOTE(JSON_EXTRACT(v_slot, '$.start_time'));
                    SET temp_end_time = JSON_UNQUOTE(JSON_EXTRACT(v_slot, '$.end_time'));
                    SET v_Batch_ID = JSON_UNQUOTE(JSON_EXTRACT(v_slot, '$.Batch_ID'));
                    SET v_Delete_Status = JSON_UNQUOTE(JSON_EXTRACT(v_slot, '$.Delete_Status'));
                    
                    SET v_start_time = CASE 
                        WHEN temp_start_time REGEXP '^[0-9]{1,2}:[0-9]{2} [AP]M$' 
                        THEN TIME_FORMAT(STR_TO_DATE(temp_start_time, '%l:%i %p'), '%H:%i')
                        ELSE TIME_FORMAT(TIME(temp_start_time), '%H:%i')
                    END;

                    SET v_end_time = CASE 
                        WHEN temp_end_time REGEXP '^[0-9]{1,2}:[0-9]{2} [AP]M$' 
                        THEN TIME_FORMAT(STR_TO_DATE(temp_end_time, '%l:%i %p'), '%H:%i')
                        ELSE TIME_FORMAT(TIME(temp_end_time), '%H:%i')
                    END;

                    IF v_Slot_Id IS NULL OR v_Slot_Id <= 0 THEN
                        IF v_Batch_ID > 0 THEN
                            INSERT INTO teacher_time_slot (CourseTeacher_ID, start_time, end_time, batch_id, Delete_Status)
                            VALUES (v_CourseTeacher_ID, v_start_time, v_end_time, v_Batch_ID, v_Delete_Status);
                        ELSE
                            INSERT INTO teacher_time_slot (CourseTeacher_ID, start_time, end_time, Delete_Status)
                            VALUES (v_CourseTeacher_ID, v_start_time, v_end_time, v_Delete_Status);
                        END IF;
                    ELSE
                        IF v_Batch_ID > 0 THEN
                            UPDATE teacher_time_slot
                            SET start_time = v_start_time,
                                end_time = v_end_time,
                                batch_id = v_Batch_ID,
                                Delete_Status = v_Delete_Status
                            WHERE Slot_Id = v_Slot_Id;
                        ELSE
                            UPDATE teacher_time_slot
                            SET start_time = v_start_time,
                                end_time = v_end_time,
                                batch_id = Null,
                                Delete_Status = v_Delete_Status
                            WHERE Slot_Id = v_Slot_Id;
                        END IF;
                    END IF;

                    SET v_slotIndex = v_slotIndex + 1;
                END WHILE;

                SET v_TimeSlotcourseIndex = v_TimeSlotcourseIndex + 1;
            END WHILE;

        ELSEIF User_Type_Id_ = 3 THEN
            IF EXISTS (SELECT 1 FROM course_teacher WHERE Teacher_ID = User_ID_ AND Delete_Status = 0) THEN
                UPDATE users SET User_Type_Id = 2 WHERE User_ID = User_ID_;
                SET User_ID_ = -1;
            ELSE
                DELETE FROM course_hod WHERE User_ID = User_ID_;
                
                SET HodtotalCourses = JSON_LENGTH(Course_IDs_);
 
                WHILE courseIndex < HodtotalCourses DO
                    INSERT INTO course_hod (Course_ID, User_ID, Delete_Status)
                    VALUES (CAST(JSON_EXTRACT(Course_IDs_, CONCAT('$[', courseIndex, ']')) AS UNSIGNED), User_ID_, 0);
                    SET courseIndex = courseIndex + 1;
                END WHILE;
            END IF;
        END IF;
    END IF;

    SELECT User_ID_ AS User_ID;
END;
        `;
        
        await connection.query(saveUserSP);
        console.log('Successfully updated Save_User stored procedure');

        await connection.end();
    } catch (err) {
        console.error('Error applying DB changes:', err);
        process.exit(1);
    }
}

applyChanges();
