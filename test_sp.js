const mysql = require('mysql2/promise');

const dbConfig = {
    host: "DESKTOP-IK6ME8M",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    multipleStatements: true
};

async function test() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await mysql.createConnection(dbConfig);

        console.log("=== Teacher 66 (JOBIN) - should see python students now ===");
        const [jobin] = await connection.query("CALL Get_Teacher_Students(66, 0)");
        console.log(jobin[0].map(r => ({ name: r.First_Name, course: r.Course_Name, batch: r.Batch_Name })));

        console.log("\n=== Teacher 71 (rohit) - should still see python students ===");
        const [rohit] = await connection.query("CALL Get_Teacher_Students(71, 0)");
        console.log(rohit[0].map(r => ({ name: r.First_Name, course: r.Course_Name, batch: r.Batch_Name })));

        console.log("\n=== Teacher 70 (new) - deleted course, should be empty ===");
        const [newT] = await connection.query("CALL Get_Teacher_Students(70, 0)");
        console.log(newT[0].length > 0 ? newT[0] : "EMPTY (correct!)");

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

test();
