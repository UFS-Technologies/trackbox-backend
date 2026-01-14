const db = require('./config/dbconnection');
const { executeTransaction } = require('./helpers/sp-caller');

async function testCheckUser() {
    console.log('Testing check_User SP via application logic...');
    try {
        // Mock userId 1, student 0, and some token
        // We'll see what it actually returns
        const result = await executeTransaction('check_User', [1, 0, 'some-token']);
        console.log('Result type:', typeof result);
        console.log('Is array:', Array.isArray(result));
        console.log('Content:', JSON.stringify(result, null, 2));
        
        if (Array.isArray(result) && result.length > 0) {
            console.log('First element status:', result[0].status);
        } else if (result) {
            console.log('Status field:', result.status);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testCheckUser();
