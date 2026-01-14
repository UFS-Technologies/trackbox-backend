const AWS = require('aws-sdk');

// Configuration using environment variables
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-2",
    signatureVersion: 'v4' // Required for signed URLs in us-east-2
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ufsnabeelphotoalbum';

/**
 * Generate a signed URL for uploading an object to S3
 * @param {string} key - The destination key in S3
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The signed URL
 */
const getUploadSignedUrl = async (key, contentType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: contentType,
        ACL: 'public-read' // Maintain existing behavior
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) reject(err);
            else resolve(url);
        });
    });
};

/**
 * Delete an object from S3
 * @param {string} key - The key of the object to delete
 * @returns {Promise<any>}
 */
const deleteObject = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    return s3.deleteObject(params).promise();
};

module.exports = {
    getUploadSignedUrl,
    deleteObject
};
