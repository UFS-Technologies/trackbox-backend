const express = require('express');
const router = express.Router();
const s3Helper = require('../helpers/s3');

/**
 * GET /s3/upload-url
 * Query params: key, contentType
 */
router.get('/upload-url', async (req, res) => {
    try {
        const { key, contentType } = req.query;
        if (!key || !contentType) {
            return res.status(400).json({ success: false, message: 'Key and contentType are required' });
        }

        const url = await s3Helper.getUploadSignedUrl(key, contentType);
        res.json({ success: true, url });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ success: false, message: 'Failed to generate signed URL', error: error.message });
    }
});

/**
 * POST /s3/delete
 * Body: { key }
 */
router.post('/delete', async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key is required' });
        }

        await s3Helper.deleteObject(key);
        res.json({ success: true, message: 'Object deleted successfully' });
    } catch (error) {
        console.error('Error deleting S3 object:', error);
        res.status(500).json({ success: false, message: 'Failed to delete S3 object', error: error.message });
    }
});

module.exports = router;
