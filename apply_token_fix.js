const db = require('./config/dbconnection');

async function applyFixes() {
    console.log("Starting DB Schema Update...");

    const query1 = "ALTER TABLE login_users MODIFY COLUMN JWT_Token VARCHAR(1000)";
    const query2 = `
        DROP PROCEDURE IF EXISTS Insert_Login_User;
        CREATE PROCEDURE Insert_Login_User(
            IN p_User_Id INT,
            IN p_Is_Student TINYINT,
            IN p_User_Type_Id INT,
            IN p_JWT_Token VARCHAR(100) -- This was probably the error in previous iterations or DB
        )
        BEGIN
            DECLARE v_Login_Time VARCHAR(45);
            DECLARE v_Existing_Login_ID INT;
            SET v_Login_Time = NOW();
            
            SELECT Login_ID INTO v_Existing_Login_ID 
            FROM login_users 
            WHERE User_Id = p_User_Id AND Is_Student = p_Is_Student;

            IF v_Existing_Login_ID IS NOT NULL THEN
                UPDATE login_users SET User_Type_Id = p_User_Type_Id, Login_Time = v_Login_Time, JWT_Token = p_JWT_Token
                WHERE Login_ID = v_Existing_Login_ID;
            ELSE
                INSERT INTO login_users (User_Id, Is_Student, User_Type_Id, Login_Time, JWT_Token)
                VALUES (p_User_Id, p_Is_Student, p_User_Type_Id, v_Login_Time, p_JWT_Token);
                SET v_Existing_Login_ID = LAST_INSERT_ID();
            END IF;
            
            IF p_Is_Student = 1 THEN
                UPDATE student SET Last_Online = NOW() WHERE Student_ID = p_User_Id;
            END IF;
            
            SELECT v_Existing_Login_ID AS Login_ID;
        END;
    `.replace('VARCHAR(100)', 'VARCHAR(1000)'); // Ensuring it's 1000

    return new Promise((resolve, reject) => {
        db.query(query1, (err, results) => {
            if (err) {
                console.error("Error modifying table:", err);
                return reject(err);
            }
            console.log("Table modified successfully.");

            // For multiple statements (if allowed in pool config, which it is: multipleStatements: true)
            db.query(query2, (err2, results2) => {
                if (err2) {
                    console.error("Error updating SP:", err2);
                    return reject(err2);
                }
                console.log("Stored Procedure updated successfully.");
                resolve();
                process.exit(0);
            });
        });
    });
}

applyFixes().catch(err => {
    console.error("Fix failed:", err);
    process.exit(1);
});
