require('dotenv').config();
const AWS = require('aws-sdk');

const r2Client = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.CLOUDFLARE_R2_ENDPOINT),
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto',
    s3ForcePathStyle: true
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'trackbox';

const corsParams = {
    Bucket: BUCKET_NAME,
    CORSConfiguration: {
        CORSRules: [
            {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedOrigins: ['*'],
                ExposeHeaders: []
            }
        ]
    }
};

r2Client.putBucketCors(corsParams, (err, data) => {
    if (err) {
        console.error("Error applying CORS policy:", err);
    } else {
        console.log("Successfully applied CORS policy to bucket:", BUCKET_NAME);
        console.log(data);
    }
});
