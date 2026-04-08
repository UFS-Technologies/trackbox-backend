const db = require('./config/dbconnection');
const util = require('util');

async function run() {
    const query = util.promisify(db.query).bind(db);
    try {
        await query(`
CREATE TABLE IF NOT EXISTS Staff_Attendance (
    Attendance_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Attendance_Date DATE NOT NULL,
    Check_In_Time DATETIME NULL,
    Check_Out_Time DATETIME NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES users(User_ID)
);`);
        console.log("Table created.");

        await query(`DROP PROCEDURE IF EXISTS Save_Staff_Attendance;`);
        await query(`
CREATE PROCEDURE Save_Staff_Attendance(
    IN p_User_ID INT
)
BEGIN
    DECLARE v_Attendance_ID INT;
    DECLARE v_Check_Out_Time DATETIME;
    DECLARE v_Current_Time DATETIME;
    DECLARE v_Current_Date DATE;
    
    SET v_Current_Time = NOW();
    SET v_Current_Date = CURDATE();
    
    SELECT Attendance_ID, Check_Out_Time INTO v_Attendance_ID, v_Check_Out_Time
    FROM Staff_Attendance
    WHERE User_ID = p_User_ID AND Attendance_Date = v_Current_Date
    ORDER BY Attendance_ID DESC
    LIMIT 1;
    
    IF v_Attendance_ID IS NULL OR v_Check_Out_Time IS NOT NULL THEN
        INSERT INTO Staff_Attendance (User_ID, Attendance_Date, Check_In_Time)
        VALUES (p_User_ID, v_Current_Date, v_Current_Time);
        SELECT LAST_INSERT_ID() as Attendance_ID, 'Checked In' as Status;
    ELSE
        UPDATE Staff_Attendance
        SET Check_Out_Time = v_Current_Time
        WHERE Attendance_ID = v_Attendance_ID;
        SELECT v_Attendance_ID as Attendance_ID, 'Checked Out' as Status;
    END IF;
END;
`);
        console.log("Save_Staff_Attendance created.");

        await query(`DROP PROCEDURE IF EXISTS Get_Staff_Attendance;`);
        await query(`
CREATE PROCEDURE Get_Staff_Attendance(
    IN p_Date DATE
)
BEGIN
    IF p_Date IS NULL THEN
        SELECT sa.*, u.First_Name, u.Last_Name, u.PhoneNumber
        FROM Staff_Attendance sa
        JOIN users u ON sa.User_ID = u.User_ID
        ORDER BY sa.Attendance_Date DESC, sa.Check_In_Time DESC;
    ELSE
        SELECT sa.*, u.First_Name, u.Last_Name, u.PhoneNumber
        FROM Staff_Attendance sa
        JOIN users u ON sa.User_ID = u.User_ID
        WHERE sa.Attendance_Date = p_Date
        ORDER BY sa.Check_In_Time DESC;
    END IF;
END;
`);
        console.log("Get_Staff_Attendance created.");
        
        process.exit(0);
    } catch(err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
run();
