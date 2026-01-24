const AWS = require('aws-sdk');

// Cloudflare R2 configuration
// R2 is S3-compatible, so we use the S3 client but with Cloudflare specific credentials and endpoint.
let r2Client = null;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'trackbox';
const PUBLIC_URL_PREFIX = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-11714a99f3bd420ca95f23dda2af714b.r2.dev';

if (process.env.CLOUDFLARE_R2_ENDPOINT) {
    try {
        r2Client = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.CLOUDFLARE_R2_ENDPOINT),
            accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
            region: 'auto',
            s3ForcePathStyle: true
        });
        console.log("✅ Cloudflare R2 client initialized successfully.");
    } catch (error) {
        console.error("❌ Error initializing Cloudflare R2 client:", error.message);
    }
} else {
    console.warn("⚠️ Cloudflare R2: CLOUDFLARE_R2_ENDPOINT not found. R2 features will be disabled.");
}

/**
 * Generate a signed URL for uploading an object to Cloudflare R2
 * @param {string} key - The destination key in R2
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The signed URL
 */
const getUploadSignedUrl = async (key, contentType) => {
    if (!r2Client) {
        console.warn("⚠️ Cloudflare R2 client not initialized. Skipping getUploadSignedUrl.");
        return null;
    }
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: contentType
    };

    return new Promise((resolve, reject) => {
        r2Client.getSignedUrl('putObject', params, (err, url) => {
            if (err) reject(err);
            else resolve(url);
        });
    });
};

/**
 * Delete an object from Cloudflare R2
 * @param {string} key - The key of the object to delete
 * @returns {Promise<any>}
 */
const deleteObject = async (key) => {
    if (!r2Client) {
        console.warn("⚠️ Cloudflare R2 client not initialized. Skipping deleteObject.");
        return null;
    }
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    return r2Client.deleteObject(params).promise();
};

module.exports = {
    getUploadSignedUrl,
    deleteObject,
    PUBLIC_URL_PREFIX
};
