-- Stored Procedure: Save_Exam_Result
DROP PROCEDURE IF EXISTS Save_Exam_Result;

CREATE PROCEDURE Save_Exam_Result(
    IN p_student_id INT,
    IN p_course_id INT,
    IN p_exam_data_id INT,
    IN p_total_mark DECIMAL(10,2),
    IN p_pass_mark DECIMAL(10,2),
    IN p_obtained_mark DECIMAL(10,2)
)
BEGIN
    DECLARE v_exam_result_master_id INT;
    
    INSERT INTO exam_result_master (
        student_id,
        course_id,
        exam_data_id,
        total_mark,
        pass_mark,
        obtained_mark
    ) VALUES (
        p_student_id,
        p_course_id,
        p_exam_data_id,
        p_total_mark,
        p_pass_mark,
        p_obtained_mark
    );
    
    SET v_exam_result_master_id = LAST_INSERT_ID();
    
    SELECT 
        v_exam_result_master_id AS exam_result_master_id,
        p_student_id AS student_id,
        p_course_id AS course_id,
        p_exam_data_id AS exam_data_id,
        p_total_mark AS total_mark,
        p_pass_mark AS pass_mark,
        p_obtained_mark AS obtained_mark,
        'Exam result saved successfully' AS message;
END;
