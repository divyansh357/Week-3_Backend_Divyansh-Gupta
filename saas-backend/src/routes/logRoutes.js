const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Only Admins should see the audit trail
router.get('/', verifyToken, verifyAdmin, getLogs);

module.exports = router;