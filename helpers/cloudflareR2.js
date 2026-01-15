const AWS = require('aws-sdk');

// Cloudflare R2 configuration
// R2 is S3-compatible, so we use the S3 client but with Cloudflare specific credentials and endpoint.
const r2Client = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.CLOUDFLARE_R2_ENDPOINT),
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto'
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'trackbox';
const PUBLIC_URL_PREFIX = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-11714a99f3bd420ca95f23dda2af714b.r2.dev';

/**
 * Generate a signed URL for uploading an object to Cloudflare R2
 * @param {string} key - The destination key in R2
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The signed URL
 */
const getUploadSignedUrl = async (key, contentType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: contentType,
        ACL: 'public-read' // Cloudflare R2 supports this if configured, or it might ignore it depending on setup
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
