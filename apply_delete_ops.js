const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'breffini-live',
    multipleStatements: true
};

const sql = `
-- 7. Stored Procedure: Delete_Teacher_Qualification
DROP PROCEDURE IF EXISTS \`Delete_Teacher_Qualification\`;
CREATE PROCEDURE \`Delete_Teacher_Qualification\`(
    IN p_Qualification_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM \`TeacherQualifications\` 
    WHERE \`Qualification_ID\` = p_Qualification_ID AND \`Teacher_ID\` = p_Teacher_ID;
    
    SELECT * FROM \`TeacherQualifications\` WHERE \`Teacher_ID\` = p_Teacher_ID;
END;

-- 8. Stored Procedure: Delete_Teacher_Experience
DROP PROCEDURE IF EXISTS \`Delete_Teacher_Experience\`;
CREATE PROCEDURE \`Delete_Teacher_Experience\`(
    IN p_Experience_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM \`TeacherExperience\` 
    WHERE \`Experience_ID\` = p_Experience_ID AND \`Teacher_ID\` = p_Teacher_ID;
    
    SELECT * FROM \`TeacherExperience\` WHERE \`Teacher_ID\` = p_Teacher_ID;
END;
`;

async function main() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to:', dbConfig.database);

        console.log('Checking for tables...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));

        console.log('Applying Delete Stored Procedures...');
        await connection.query(sql);
        console.log('Delete operations applied successfully.');

        console.log('Verifying created procedures...');
        const [procs] = await connection.query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'breffini-live' AND ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME LIKE 'Delete_Teacher%'");
        console.log('Created Procedures:', procs);

    } catch (error) {
        console.error('Error applying changes:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
