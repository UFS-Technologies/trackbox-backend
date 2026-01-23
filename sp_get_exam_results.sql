-- Stored Procedure: Get_Exam_Results_By_Student
DROP PROCEDURE IF EXISTS Get_Exam_Results_By_Student;

CREATE PROCEDURE Get_Exam_Results_By_Student(
    IN p_student_id INT,
    IN p_course_id INT
)
BEGIN
    IF p_course_id IS NULL OR p_course_id = 0 THEN
        SELECT 
            erm.exam_result_master_id,
            erm.student_id,
            erm.course_id,
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
        SELECT 
            erm.exam_result_master_id,
            erm.student_id,
            erm.course_id,
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
END;
