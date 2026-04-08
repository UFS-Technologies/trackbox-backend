const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.jwtSecret;
const url = 'http://localhost:3515';
const userId = 17;

const token = jwt.sign({ userId: userId, isStudent: 0 }, secret, { expiresIn: '1h' });
const config = { headers: { Authorization: `Bearer ${token}` } };
const db = require('./config/dbconnection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function test() {
    try {
        console.log('--- Setting up Test Token in DB ---');
        await query('INSERT INTO login_users (User_Id, Is_Student, JWT_Token) VALUES (?, ?, ?)', [userId, 0, token]);

        console.log('--- Step 1: Check In ---');
        const checkInRes = await axios.post(`${url}/teacher/Save_Staff_Attendance`, { User_ID: userId }, config);
        console.log('Check In Response:', checkInRes.data);

        console.log('\n--- Step 2: Get Attendance ---');
        const getRes = await axios.get(`${url}/teacher/Get_Staff_Attendance`, config);
        console.log('Attendance Records:', JSON.stringify(getRes.data, null, 2));

        console.log('\n--- Step 3: Check Out ---');
        const checkOutRes = await axios.post(`${url}/teacher/Save_Staff_Attendance`, { User_ID: userId }, config);
        console.log('Check Out Response:', checkOutRes.data);

        console.log('\n--- Step 4: Final Check ---');
        const finalRes = await axios.get(`${url}/teacher/Get_Staff_Attendance`, config);
        console.log('Final Attendance Records:', JSON.stringify(finalRes.data, null, 2));

        console.log('\n--- Cleaning up Test Token ---');
        await query('DELETE FROM login_users WHERE JWT_Token = ?', [token]);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        if (token) {
            await query('DELETE FROM login_users WHERE JWT_Token = ?', [token]);
        }
        process.exit(1);
    }
}

test();
