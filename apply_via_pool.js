const pool = require('./config/dbconnection');

const sql = `
DROP PROCEDURE IF EXISTS Delete_Teacher_Qualification;
CREATE PROCEDURE Delete_Teacher_Qualification(
    IN p_Qualification_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM TeacherQualifications 
    WHERE Qualification_ID = p_Qualification_ID AND Teacher_ID = p_Teacher_ID;
    
    SELECT * FROM TeacherQualifications WHERE Teacher_ID = p_Teacher_ID;
END;

DROP PROCEDURE IF EXISTS Delete_Teacher_Experience;
CREATE PROCEDURE Delete_Teacher_Experience(
    IN p_Experience_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM TeacherExperience 
    WHERE Experience_ID = p_Experience_ID AND Teacher_ID = p_Teacher_ID;
    
    SELECT * FROM TeacherExperience WHERE Teacher_ID = p_Teacher_ID;
END;
`;

async function main() {
    try {
        console.log('Using app DB pool to apply procedures...');
        // mysql2 pool execution with multipleStatements should handle this
        await pool.promise().query(sql);
        console.log('Procedures created successfully using pool.');
        
        const [rows] = await pool.promise().query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'breffini-live' AND ROUTINE_NAME LIKE 'Delete_Teacher%'");
        console.log('Verified procedures:', rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Error applying procedures via pool:', error);
        process.exit(1);
    }
}

main();
