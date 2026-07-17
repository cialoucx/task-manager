const express = require('express');
const router = express.Router();
const { getTimeline } = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTimeline);

module.exports = router;
