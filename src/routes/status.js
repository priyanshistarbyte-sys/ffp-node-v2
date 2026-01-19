const express = require('express');
const router =  express.Router();

var status = require('@/controllers/status');

router.post('/get-status-categories',status.getStatusCategories);
router.post('/get-status-photos',status.getStatusPhotos);

module.exports = router;
