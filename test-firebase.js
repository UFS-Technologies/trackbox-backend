const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "breffini-app-firebase-adminsdk-dzxda-ca2f1a6c2b.json");

if (!fs.existsSync(configPath)) {
    console.error("Config file not found at:", configPath);
    process.exit(1);
}

const serviceAccount = require(configPath);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase initialized.");

    // Attempt to get an access token to verify the signature
    admin.credential.cert(serviceAccount).getAccessToken()
        .then(token => {
            console.log("Successfully fetched access token!");
            process.exit(0);
        })
        .catch(err => {
            console.error("Failed to fetch access token:", err);
            process.exit(1);
        });
} catch (e) {
    console.error("Initialization failed:", e);
    process.exit(1);
}
