const express = require('express');
const router = express.Router();
const r2Helper = require('../helpers/cloudflareR2');

/**
 * GET /r2/upload-url
 * Query params: key, contentType
 */
router.get('/upload-url', async (req, res) => {
    try {
        const { key, contentType } = req.query;
        if (!key || !contentType) {
            return res.status(400).json({ success: false, message: 'Key and contentType are required' });
        }

        const url = await r2Helper.getUploadSignedUrl(key, contentType);
        res.json({ success: true, url });
    } catch (error) {
        console.error('Error generating Cloudflare R2 signed URL:', error);
        res.status(500).json({ success: false, message: 'Failed to generate signed URL', error: error.message });
    }
});

/**
 * POST /r2/delete
 * Body: { key }
 */
router.post('/delete', async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key is required' });
        }

        await r2Helper.deleteObject(key);
        res.json({ success: true, message: 'Object deleted successfully from Cloudflare R2' });
    } catch (error) {
        console.error('Error deleting Cloudflare R2 object:', error);
        res.status(500).json({ success: false, message: 'Failed to delete object', error: error.message });
    }
});

module.exports = router;
