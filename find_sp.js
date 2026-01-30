
const fs = require('fs');
const path = require('path');

const filePath = 'd:\\happy_english\\trackbox-backend\\briffni-sp.sql';
const fileContent = fs.readFileSync(filePath, 'utf8');

const lines = fileContent.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('PROCEDURE `Search_User`')) {
        console.log(`Found on line ${i + 1}`);
        // Log the next 50 lines to see parameters
        for (let j = 0; j < 30; j++) {
            console.log(lines[i + j]);
        }
        break;
    }
}
