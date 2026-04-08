const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./config/dbconnection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

const secret = process.env.jwtSecret;
const url = 'http://localhost:3515';
const userId = 17; // Active user Leena

const token = jwt.sign({ userId: userId, isStudent: 0 }, secret, { expiresIn: '1h' });
const config = { headers: { Authorization: `Bearer ${token}` } };

async function test() {
    try {
        console.log('--- Setting up Test Token ---');
        await query('INSERT INTO login_users (User_Id, Is_Student, JWT_Token) VALUES (?, ?, ?)', [userId, 0, token]);

        console.log('\n--- Session 1: Check In ---');
        const res1 = await axios.post(`${url}/teacher/Save_Staff_Attendance`, { User_ID: userId }, config);
        console.log('Res:', res1.data);

        console.log('\n--- Session 1: Check Out ---');
        const res2 = await axios.post(`${url}/teacher/Save_Staff_Attendance`, { User_ID: userId }, config);
        console.log('Res:', res2.data);

        console.log('\n--- Session 2: Check In ---');
        const res3 = await axios.post(`${url}/teacher/Save_Staff_Attendance`, { User_ID: userId }, config);
        console.log('Res:', res3.data);

        console.log('\n--- Final Check: API Data ---');
        const finalRes = await axios.get(`${url}/teacher/Get_Staff_Attendance?date=${new Date().toISOString().substring(0, 10)}`, config);
        console.log('Data:', JSON.stringify(finalRes.data.rows.filter(r => r.User_ID === userId), null, 2));

        console.log('\n--- Cleaning up ---');
        await query('DELETE FROM login_users WHERE JWT_Token = ?', [token]);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await query('DELETE FROM login_users WHERE JWT_Token = ?', [token]);
        process.exit(1);
    }
}

test();
