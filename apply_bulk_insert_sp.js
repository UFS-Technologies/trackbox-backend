const db = require('./config/dbconnection');

const sp_bulk_insert_questions = `
CREATE PROCEDURE SP_Bulk_Insert_Questions(
    IN p_exam_data_id INT,
    IN p_course_exam_id INT,
    IN p_json_data LONGTEXT
)
BEGIN
    INSERT INTO questions (exam_data_id, course_exam_id, question_name, option1, option2, option3, option4, correct_answer)
    SELECT 
        p_exam_data_id, 
        p_course_exam_id, 
        jt.question_name, 
        jt.option1, 
        jt.option2, 
        jt.option3, 
        jt.option4, 
        jt.correct_answer
    FROM JSON_TABLE(
        p_json_data, 
        '$[*]' COLUMNS (
            question_name VARCHAR(2000) PATH '$.question_name',
            option1 VARCHAR(255) PATH '$.option1',
            option2 VARCHAR(255) PATH '$.option2',
            option3 VARCHAR(255) PATH '$.option3',
            option4 VARCHAR(255) PATH '$.option4',
            correct_answer VARCHAR(255) PATH '$.correct_answer'
        )
    ) AS jt;
    
    SELECT ROW_COUNT() as inserted_count;
END;
`;

async function applySPs() {
    try {
        console.log("Dropping SP_Bulk_Insert_Questions if it exists...");
        await db.promise().query("DROP PROCEDURE IF EXISTS SP_Bulk_Insert_Questions");

        console.log("Creating SP_Bulk_Insert_Questions...");
        await db.promise().query(sp_bulk_insert_questions);

        console.log("SP_Bulk_Insert_Questions created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating stored procedure:", error);
        process.exit(1);
    }
}

applySPs();
