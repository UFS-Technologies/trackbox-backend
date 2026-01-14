const fs = require('fs');
fs.writeFileSync('test_write.txt', 'Node is working at ' + new Date().toISOString());
console.log('Done');
