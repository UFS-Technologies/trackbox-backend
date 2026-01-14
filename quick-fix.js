const mysql = require('mysql2/promise');

async function fixSP() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'breffini-live'
    });
    
    console.log('Connected');
    await connection.query('DROP PROCEDURE IF EXISTS check_User');
    await connection.query(\`
CREATE PROCEDURE check_User(IN p_UserId INT, IN p_IsStudent TINYINT, IN p_Token LONGTEXT)
BEGIN
    DECLARE v_DeleteStatus TINYINT;
    DECLARE usertype_ TINYINT DEFAULT 0;
    DECLARE v_TokenCount INT DEFAULT 0;
    
    IF p_IsStudent = 0 THEN
        SELECT Delete_Status, User_Type_Id INTO v_DeleteStatus, usertype_ FROM users WHERE User_ID = p_UserId;
    ELSE
        SELECT Delete_Status INTO v_DeleteStatus FROM student WHERE Student_ID = p_UserId;
    END IF;

    SELECT COUNT(*) INTO v_TokenCount FROM login_users WHERE User_Id = p_UserId AND Is_Student = p_IsStudent AND JWT_Token = p_Token;

    IF usertype_ = 1 THEN SET v_TokenCount = 1; END IF;

    SELECT
        CASE
            WHEN v_DeleteStatus IS NULL THEN 'NOT_FOUND'
            WHEN v_DeleteStatus = 1 THEN 'DELETED'
            WHEN v_DeleteStatus = 0 AND v_TokenCount > 0 THEN 'ACTIVE'
            WHEN v_DeleteStatus = 0 AND v_TokenCount = 0 THEN 'INVALID_TOKEN'
            ELSE 'Unknown status'
        END AS status;
END\`);
    console.log('Done');
    await connection.end();
}

fixSP().catch(console.error);
