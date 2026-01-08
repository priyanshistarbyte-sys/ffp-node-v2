const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var family = require('@/controllers/family');

router.post('/get-family-categories',family.getFamilyCategories);
router.post('/upload-birthday-image',family.uploadBirthDayBase64Image);

module.exports = router;
