const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing /student/login...');
        const response = await axios.post('http://localhost:3515/student/login', {
            email: 'nonexistent@test.com',
            password: 'password123'
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
