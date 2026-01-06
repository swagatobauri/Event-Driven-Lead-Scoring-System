// Routes define the API endpoints.
// Example: router.get('/leads', leadController.getLeads);
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('API Root');
});

module.exports = router;
