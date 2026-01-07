const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');

router.get('/', rulesController.getRules);
router.post('/', rulesController.updateRule);

module.exports = router;
