
const db = require('./config/dbconnection');

const sp_questions_manage = `
CREATE PROCEDURE SP_Questions_Manage(
    IN p_action VARCHAR(20),
    IN p_question_id INT,
    IN p_exam_data_id INT,
    IN p_course_exam_id INT,
    IN p_question_name VARCHAR(2000),
    IN p_option1 VARCHAR(255),
    IN p_option2 VARCHAR(255),
    IN p_option3 VARCHAR(255),
    IN p_option4 VARCHAR(255),
    IN p_correct_answer VARCHAR(255)
)
BEGIN
    IF p_action = 'INSERT' THEN
        INSERT INTO questions (exam_data_id, course_exam_id, question_name, option1, option2, option3, option4, correct_answer) 
        VALUES (p_exam_data_id, p_course_exam_id, p_question_name, p_option1, p_option2, p_option3, p_option4, p_correct_answer);
        SELECT LAST_INSERT_ID() AS id;
    ELSEIF p_action = 'UPDATE' THEN
        UPDATE questions 
        SET exam_data_id = p_exam_data_id, 
            course_exam_id = p_course_exam_id, 
            question_name = p_question_name, 
            option1 = p_option1, 
            option2 = p_option2, 
            option3 = p_option3, 
            option4 = p_option4, 
            correct_answer = p_correct_answer 
        WHERE question_id = p_question_id;
    ELSEIF p_action = 'DELETE' THEN
        DELETE FROM questions WHERE question_id = p_question_id;
    ELSEIF p_action = 'SELECT' THEN
        IF p_question_id IS NOT NULL THEN
            SELECT * FROM questions WHERE question_id = p_question_id;
        ELSEIF p_course_exam_id IS NOT NULL THEN
            SELECT * FROM questions WHERE course_exam_id = p_course_exam_id;
        ELSE
            SELECT * FROM questions;
        END IF;
    END IF;
END;
`;

const sp_student_get_questions = `
CREATE PROCEDURE SP_Student_GetQuestions(
    IN p_course_exam_id INT
)
BEGIN
    SELECT * FROM questions WHERE course_exam_id = p_course_exam_id;
END;
`;

async function applySPs() {
    try {
        console.log("Dropping existing SPs if they exist...");
        await db.promise().query("DROP PROCEDURE IF EXISTS SP_Questions_Manage");
        await db.promise().query("DROP PROCEDURE IF EXISTS SP_Student_GetQuestions");

        console.log("Creating SP_Questions_Manage...");
        await db.promise().query(sp_questions_manage);

        console.log("Creating SP_Student_GetQuestions...");
        await db.promise().query(sp_student_get_questions);

        console.log("Stored procedures created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating stored procedures:", error);
        process.exit(1);
    }
}

applySPs();
