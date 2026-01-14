const mysql = require('mysql2/promise');

async function fixCheckUserSP() {
    console.log('Fixing check_User stored procedure...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'breffini-live',
            multipleStatements: true
        });
        
        console.log('✅ Connected to DB');
        
        await connection.query('DROP PROCEDURE IF EXISTS check_User');
        const createSql = `
CREATE PROCEDURE \`check_User\`(
    IN p_UserId INT,
    IN p_IsStudent TINYINT,
    IN p_Token LONGTEXT
)
BEGIN
    DECLARE v_DeleteStatus TINYINT;
    DECLARE usertype_ TINYINT;
    DECLARE v_TokenCount INT;
    
    SET usertype_ = 0;
    
    -- Check the user's delete status
    IF p_IsStudent = 0 THEN
        SELECT Delete_Status, User_Type_Id INTO v_DeleteStatus, usertype_
        FROM users
        WHERE User_ID = p_UserId;
    ELSE
        SELECT Delete_Status INTO v_DeleteStatus
        FROM student
        WHERE Student_ID = p_UserId;
    END IF;

    -- Check if the user has a valid token
    SELECT COUNT(*) INTO v_TokenCount
    FROM login_users
    WHERE User_Id = p_UserId
      AND Is_Student = p_IsStudent
      AND JWT_Token = p_Token;

    -- Special handling for specific user types if needed
    IF usertype_ = 1 THEN
        SET v_TokenCount = 1;
    END IF;

    -- Return the result
    SELECT
        CASE
            WHEN v_DeleteStatus IS NULL THEN 'NOT_FOUND'
            WHEN v_DeleteStatus = 1 THEN 'DELETED'
            WHEN v_DeleteStatus = 0 AND v_TokenCount > 0 THEN 'ACTIVE'
            WHEN v_DeleteStatus = 0 AND v_TokenCount = 0 THEN 'INVALID_TOKEN'
            ELSE 'Unknown error'
        END AS status,
        CASE
            WHEN v_DeleteStatus = 0 AND v_TokenCount > 0 THEN 1
            ELSE 0
        END AS status_code,
        COALESCE(v_DeleteStatus, -1) AS delete_status,
        v_TokenCount AS token_valid;
END;
`;
        await connection.query(createSql);
        console.log('✅ check_User procedure updated successfully (logs removed).');
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing SP:', err.message);
        process.exit(1);
    }
}

fixCheckUserSP();
