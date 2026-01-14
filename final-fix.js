const mysql = require('mysql2/promise');

async function fixAll() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'breffini-live',
        multipleStatements: true
    };
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to 127.0.0.1');
        
        await connection.query('DROP PROCEDURE IF EXISTS check_User');
        
        const createSql = `
CREATE PROCEDURE \`check_User\`(
    IN p_UserId INT,
    IN p_IsStudent TINYINT,
    IN p_Token LONGTEXT
)
BEGIN
    DECLARE v_DeleteStatus TINYINT;
    DECLARE usertype_ TINYINT DEFAULT 0;
    DECLARE v_TokenCount INT DEFAULT 0;
    
    -- Get user info
    IF p_IsStudent = 0 THEN
        SELECT Delete_Status, User_Type_Id INTO v_DeleteStatus, usertype_
        FROM users
        WHERE User_ID = p_UserId;
    ELSE
        SELECT Delete_Status INTO v_DeleteStatus
        FROM student
        WHERE Student_ID = p_UserId;
    END IF;

    -- Check token
    SELECT COUNT(*) INTO v_TokenCount
    FROM login_users
    WHERE User_Id = p_UserId
      AND Is_Student = p_IsStudent
      AND JWT_Token = p_Token;

    -- Special case for HOD/Admin (Type 1)
    IF usertype_ = 1 THEN
        SET v_TokenCount = 1;
    END IF;

    -- standardize outputs
    SELECT
        CASE
            WHEN v_DeleteStatus IS NULL THEN 'NOT_FOUND'
            WHEN v_DeleteStatus = 1 THEN 'DELETED'
            WHEN v_DeleteStatus = 0 AND v_TokenCount > 0 THEN 'ACTIVE'
            WHEN v_DeleteStatus = 0 AND v_TokenCount = 0 THEN 'INVALID_TOKEN'
            ELSE 'Unknown'
        END AS status,
        CASE
            WHEN v_DeleteStatus = 0 AND v_TokenCount > 0 THEN 1
            ELSE 0
        END AS status_code;
END;
`;
        await connection.query(createSql);
        console.log('✅ check_User updated.');
        
        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

fixAll();
