// Script to run the exam_result_master migration (updated version)
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    let connection;

    try {
        // Create connection
        connection = await mysql.createConnection({
            host: "DESKTOP-IK6ME8M",
            user: 'root',
            password: 'root',
            database: "breffini-live",
            port: 3306,
            multipleStatements: true
        });

        console.log('✅ Connected to database successfully!\n');

        // Step 1: Create table
        console.log('Step 1: Creating exam_result_master table...');
        const createTableSQL = fs.readFileSync(path.join(__dirname, 'create_table.sql'), 'utf8');
        await connection.query(createTableSQL);
        console.log('✅ Table created successfully\n');

        // Step 2: Create Save_Exam_Result procedure
        console.log('Step 2: Creating Save_Exam_Result stored procedure...');
        const sp1SQL = fs.readFileSync(path.join(__dirname, 'sp_save_exam_result.sql'), 'utf8');
        await connection.query(sp1SQL);
        console.log('✅ Save_Exam_Result procedure created\n');

        // Step 3: Create Get_Exam_Results_By_Student procedure
        console.log('Step 3: Creating Get_Exam_Results_By_Student stored procedure...');
        const sp2SQL = fs.readFileSync(path.join(__dirname, 'sp_get_exam_results.sql'), 'utf8');
        await connection.query(sp2SQL);
        console.log('✅ Get_Exam_Results_By_Student procedure created\n');

        // Verify installation
        console.log('Verifying installation...');
        const [tableResult] = await connection.query('SHOW CREATE TABLE exam_result_master');
        console.log('✅ Table exam_result_master verified\n');

        const [procResult] = await connection.query("SHOW PROCEDURE STATUS WHERE Db = 'breffini-live' AND Name LIKE '%Exam_Result%'");
        console.log(`✅ Found ${procResult.length} stored procedures:`);
        procResult.forEach(proc => {
            console.log(`   - ${proc.Name}`);
        });

        console.log('\n🎉 Database migration completed successfully!');
        console.log('You can now test the API endpoints at:');
        console.log('  POST http://localhost:3000/student/Save_Exam_Result');
        console.log('  GET  http://localhost:3000/student/Get_Exam_Results/:student_id');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
