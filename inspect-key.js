const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "breffini-app-firebase-adminsdk-dzxda-ca2f1a6c2b.json");
const serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log("Private Key Start:", serviceAccount.private_key.substring(0, 50));
console.log("Private Key End:", serviceAccount.private_key.substring(serviceAccount.private_key.length - 50));
console.log("Contains actual newlines:", serviceAccount.private_key.includes('\n'));
console.log("Contains literal \\n:", serviceAccount.private_key.includes('\\n'));
