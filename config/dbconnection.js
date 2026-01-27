var mysql = require("mysql2");

var connection = mysql.createPool({
    // host: "localhost",
    // user: "basil",
    // password: "@Mnisj9645",
    // database: "breffini-live",
    // host: "68.183.80.95",
    //  user: "root",
    //  password: "@MuFsPwd123",
    //  database: "Breffni_Demo",
    //      host: '49.13.87.182',
    //  user: 'root',
    //  password: 'p8ss144t7m4', 
    // database: "trackbox_brfini_new_db",
    //    host: "DESKTOP-IK6ME8M",
    // user: "root",
    // password: "root",
    // database: "attendance_db",
    // host: 'localhost',
    host: "DESKTOP-IK6ME8M",
    // host: "localhost",
    user: 'root',
    password: 'root',
    database: "breffini-live",
    // database: "happy_english",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    connectTimeout: 30000, 
    multipleStatements: true,
});

// Monitor pool events
connection.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});

connection.on('connection', function (conn) {
    console.log('DB Connection established');

    conn.query("SET SESSION wait_timeout=28800"); // 8 hour timeout
    conn.query("SET SESSION max_execution_time=30000"); // 30 second query timeout
});

connection.on('enqueue', function () {
    console.warn('Waiting for available connection slot');
});

module.exports = connection;





