const { executeTransaction } = require('./helpers/sp-caller');

async function test() {
    console.log('Testing DB connection with SP call...');
    try {
        // Try to call a simple SP or just a query if possible
        // Since executeTransaction expects an SP, I'll try one that I saw in the code
        // Get_All_Live_Class was one of them
        const result = await executeTransaction('Get_All_Live_Class', []);
        console.log('SP Call successful. Result count:', result.length);
        process.exit(0);
    } catch (error) {
        console.error('SP Call failed:', error);
        process.exit(1);
    }
}

test();
