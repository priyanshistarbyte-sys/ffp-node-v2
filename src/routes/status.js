const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var status = require('@/controllers/status');

router.post('/get-status-categories',status.getStatusCategories);
router.post('/get-status-photos',status.getStatusPhotos);

module.exports = router;
