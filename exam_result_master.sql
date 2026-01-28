-- Migration script for exam_result_master table and stored procedures
-- Database: breffini-live

-- Create exam_result_master table
CREATE TABLE IF NOT EXISTS exam_result_master (
    exam_result_master_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    course_exam_id INT NOT NULL,
    exam_data_id INT NOT NULL,
    total_mark DECIMAL(10,2) NOT NULL,
    pass_mark DECIMAL(10,2) NOT NULL,
    obtained_mark DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_result_student FOREIGN KEY (student_id) REFERENCES student(Student_ID),
    CONSTRAINT fk_exam_result_course FOREIGN KEY (course_id) REFERENCES course(Course_ID),
    CONSTRAINT fk_exam_result_course_exam FOREIGN KEY (course_exam_id) REFERENCES course_exam(course_exam_id),
    CONSTRAINT fk_exam_result_exam_data FOREIGN KEY (exam_data_id) REFERENCES exam_data(exam_data_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_course_exam_id (course_exam_id),
    INDEX idx_exam_data_id (exam_data_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Stored Procedure: Save_Exam_Result
DELIMITER $$

DROP PROCEDURE IF EXISTS Save_Exam_Result$$

CREATE PROCEDURE Save_Exam_Result(
    IN p_student_id INT,
    IN p_course_id INT,
    IN p_course_exam_id INT,
    IN p_total_mark DECIMAL(10,2),
    IN p_pass_mark DECIMAL(10,2),
    IN p_obtained_mark DECIMAL(10,2)
)
BEGIN
    DECLARE v_exam_result_master_id INT;
    DECLARE v_exam_data_id INT;
    
    -- Lookup exam_data_id from course_exam
    SELECT exam_data_id INTO v_exam_data_id 
    FROM course_exam 
    WHERE course_exam_id = p_course_exam_id;

    -- Insert the exam result
    INSERT INTO exam_result_master (
        student_id,
        course_id,
        course_exam_id,
        exam_data_id,
        total_mark,
        pass_mark,
        obtained_mark
    ) VALUES (
        p_student_id,
        p_course_id,
        p_course_exam_id,
        v_exam_data_id,
        p_total_mark,
        p_pass_mark,
        p_obtained_mark
    );
    
    -- Get the inserted ID
    SET v_exam_result_master_id = LAST_INSERT_ID();
    
    -- Return the result
    SELECT 
        v_exam_result_master_id AS exam_result_master_id,
        p_student_id AS student_id,
        p_course_id AS course_id,
        p_course_exam_id AS course_exam_id,
        v_exam_data_id AS exam_data_id,
        p_total_mark AS total_mark,
        p_pass_mark AS pass_mark,
        p_obtained_mark AS obtained_mark,
        'Exam result saved successfully' AS message;
END$$

DELIMITER ;

-- Stored Procedure: Get_Exam_Results_By_Student
DELIMITER $$

DROP PROCEDURE IF EXISTS Get_Exam_Results_By_Student$$

CREATE PROCEDURE Get_Exam_Results_By_Student(
    IN p_student_id INT,
    IN p_course_id INT
)
BEGIN
    IF p_course_id IS NULL OR p_course_id = 0 THEN
        -- Get all exam results for the student
        SELECT 
            erm.exam_result_master_id,
            erm.student_id,
            erm.course_id,
            erm.course_exam_id,
            erm.exam_data_id,
            erm.total_mark,
            erm.pass_mark,
            erm.obtained_mark,
            erm.created_at,
            erm.updated_at,
            s.First_Name,
            s.Last_Name,
            c.Course_Name,
            ed.exam_name,
            CASE 
                WHEN erm.obtained_mark >= erm.pass_mark THEN 'Pass'
                ELSE 'Fail'
            END AS result_status,
            ROUND((erm.obtained_mark / erm.total_mark) * 100, 2) AS percentage
        FROM exam_result_master erm
        INNER JOIN student s ON erm.student_id = s.Student_ID
        INNER JOIN course c ON erm.course_id = c.Course_ID
        INNER JOIN exam_data ed ON erm.exam_data_id = ed.exam_data_id
        WHERE erm.student_id = p_student_id
        ORDER BY erm.created_at DESC;
    ELSE
        -- Get exam results for the student filtered by course
        SELECT 
            erm.exam_result_master_id,
            erm.student_id,
            erm.course_id,
            erm.course_exam_id,
            erm.exam_data_id,
            erm.total_mark,
            erm.pass_mark,
            erm.obtained_mark,
            erm.created_at,
            erm.updated_at,
            s.First_Name,
            s.Last_Name,
            c.Course_Name,
            ed.exam_name,
            CASE 
                WHEN erm.obtained_mark >= erm.pass_mark THEN 'Pass'
                ELSE 'Fail'
            END AS result_status,
            ROUND((erm.obtained_mark / erm.total_mark) * 100, 2) AS percentage
        FROM exam_result_master erm
        INNER JOIN student s ON erm.student_id = s.Student_ID
        INNER JOIN course c ON erm.course_id = c.Course_ID
        INNER JOIN exam_data ed ON erm.exam_data_id = ed.exam_data_id
        WHERE erm.student_id = p_student_id 
        AND erm.course_id = p_course_id
        ORDER BY erm.created_at DESC;
    END IF;
END$$

DELIMITER ;
