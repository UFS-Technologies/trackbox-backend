const db = require('./config/dbconnection');

async function checkSP() {
    try {
        const [rows] = await db.promise().query("SHOW PROCEDURE STATUS LIKE 'SP_Bulk_Insert_Questions'");
        if (rows.length > 0) {
            console.log("SUCCESS: SP_Bulk_Insert_Questions exists.");
        } else {
            console.error("FAILURE: SP_Bulk_Insert_Questions does NOT exist.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error checking SP:", error);
        process.exit(1);
    }
}

checkSP();
