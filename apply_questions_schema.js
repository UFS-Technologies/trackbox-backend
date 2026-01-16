
const db = require('./config/dbconnection');

const sql_questions = `
CREATE TABLE IF NOT EXISTS questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_data_id INT NOT NULL,
    course_exam_id INT NOT NULL,
    question_name VARCHAR(2000) NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255) NOT NULL,
    option4 VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (exam_data_id) REFERENCES exam_data(exam_data_id),
    FOREIGN KEY (course_exam_id) REFERENCES course_exam(course_exam_id)
);
`;

async function applySchema() {
    try {
        console.log("Applying questions table...");
        await db.promise().query(sql_questions);
        console.log("questions table applied successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error applying schema:", error);
        process.exit(1);
    }
}

applySchema();
