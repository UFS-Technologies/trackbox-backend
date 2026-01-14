const fs = require('fs');
fs.writeFileSync('test_done.txt', 'done at ' + new Date().toISOString());
console.log('done');
