const axios = require('axios');
const baseURL = 'http://127.0.0.1:3515';

const fs = require('fs');
function log(msg) {
    console.log(msg);
    fs.appendFileSync('test_output.txt', msg + '\n');
}

async function test() {
    const email = `teststudent_${Date.now()}@example.com`;
    const phone = `9${Math.floor(Math.random() * 899999999) + 100000000}`; // Random 10-digit number starting with 9
    const password = 'TestPassword123!';

    log(`1. Registering new student: ${email} (Phone: ${phone}) ...`);
    try {
        const regRes = await axios.post(`${baseURL}/student/Save_student`, {
            First_Name: 'Test',
            Last_Name: 'Student',
            Email: email,
            Phone_Number: phone,
            Password: password,
            Country_Code: '+91',
            Country_Code_Name: 'IN',
            Social_Provider: '',
            Social_ID: '',
            Delete_Status: 0,
            Avatar: '',
            Profile_Photo_Name: '',
            Profile_Photo_Path: ''
        });
        log('Registration Response: ' + JSON.stringify(regRes.data));
    } catch (e) {
        log('Registration Failed: ' + e.message);
        if (e.response) log('Response Data: ' + JSON.stringify(e.response.data));
        // Continue?
    }

    log('\n2. Attempting Login...');
    try {
        const loginRes = await axios.post(`${baseURL}/Login/Student_Login_Check`, {
            email: email,
            password: password,
            Device_ID: 'test_device'
        });
        log('Login Response: ' + JSON.stringify(loginRes.data));
        if (loginRes.data.token) {
            log('SUCCESS: Token received.');
        } else {
            log('FAILURE: No token received.');
        }
    } catch (e) {
        log('Login Failed: ' + e.message);
        if (e.response) log('Response Data: ' + JSON.stringify(e.response.data));
    }
}

test();
