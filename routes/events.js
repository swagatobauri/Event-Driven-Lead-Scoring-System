const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/', eventController.ingestEvent);
router.post('/webhook', eventController.handleWebhook);
router.post('/batch', eventController.handleBatchUpload);

module.exports = router;
