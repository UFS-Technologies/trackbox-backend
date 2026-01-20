const axios = require('axios');
const baseURL = 'http://127.0.0.1:3520';

async function testAdminLogin() {
    console.log('1. Attempting Admin Login...');
    try {
        const loginRes = await axios.post(`${baseURL}/Login/Login_Check`, {
            email: 'farsana@ufstechnologies.com', // Using an email found in the code
            password: 'password', // Assuming a common placeholder if not known
            Device_ID: 'test_admin_device'
        });
        console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
        if (loginRes.data.token) {
            console.log('SUCCESS: Token received.');

            // Test a protected route
            console.log('\n2. Testing Protected Route...');
            const protectedRes = await axios.get(`${baseURL}/course_category/Search_course_category`, {
                headers: { 'Authorization': `Bearer ${loginRes.data.token}` }
            });
            console.log('Protected Route Response received successfully.');
        }
    } catch (e) {
        console.log('Login Failed:', e.message);
        if (e.response) {
            console.log('Response status:', e.response.status);
            console.log('Response Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

testAdminLogin();
