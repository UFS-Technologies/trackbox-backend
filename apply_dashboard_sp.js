const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyDashboardSP() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: "DESKTOP-IK6ME8M",
            user: 'root',
            password: 'root',
            database: "breffini-live",
            port: 3306,
            multipleStatements: true
        });

        console.log('✅ Connected to database successfully!\n');

        const sqlPath = path.join(__dirname, 'briffni-sp.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Extract the Get_Dashboard procedure definition
        const procedureMatch = sqlContent.match(/CREATE DEFINER=`root`@`%` PROCEDURE `Get_Dashboard`[\s\S]*?END ;;/);

        if (!procedureMatch) {
            throw new Error('Could not find Get_Dashboard procedure in briffni-sp.sql');
        }

        const procedureSQL = procedureMatch[0].replace(';;', '');

        console.log('Updating Get_Dashboard stored procedure...');
        await connection.query('DROP PROCEDURE IF EXISTS `Get_Dashboard`');
        await connection.query(procedureSQL);
        console.log('✅ Get_Dashboard procedure updated successfully\n');

    } catch (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

applyDashboardSP();
