require('dotenv').config();
const AWS = require('aws-sdk');

const r2Client = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.CLOUDFLARE_R2_ENDPOINT),
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto'
});

r2Client.listBuckets((err, data) => {
    if (err) {
        console.error("Error listing buckets:", err);
    } else {
        console.log("Buckets:", data.Buckets);
    }
});
