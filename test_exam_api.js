// Test script for exam result API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/student';

async function testAPIs() {
    console.log('🧪 Testing Exam Result API Endpoints\n');

    try {
        // Test 1: Save Exam Result
        console.log('Test 1: POST /Save_Exam_Result');
        console.log('----------------------------------------');
        const saveData = {
            student_id: 1,
            course_id: 1,
            exam_data_id: 1,
            total_mark: 100,
            pass_mark: 50,
            obtained_mark: 75
        };

        console.log('Request:', JSON.stringify(saveData, null, 2));
        const saveResponse = await axios.post(`${BASE_URL}/Save_Exam_Result`, saveData);
        console.log('✅ Response:', JSON.stringify(saveResponse.data, null, 2));
        console.log('\n');

        // Test 2: Get Exam Results for Student
        console.log('Test 2: GET /Get_Exam_Results/:student_id');
        console.log('----------------------------------------');
        const getResponse = await axios.get(`${BASE_URL}/Get_Exam_Results/1`);
        console.log('✅ Response:', JSON.stringify(getResponse.data, null, 2));
        console.log('\n');

        // Test 3: Get Exam Results filtered by Course
        console.log('Test 3: GET /Get_Exam_Results/:student_id?course_id=1');
        console.log('----------------------------------------');
        const getFilteredResponse = await axios.get(`${BASE_URL}/Get_Exam_Results/1?course_id=1`);
        console.log('✅ Response:', JSON.stringify(getFilteredResponse.data, null, 2));
        console.log('\n');

        console.log('🎉 All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        process.exit(1);
    }
}

testAPIs();
