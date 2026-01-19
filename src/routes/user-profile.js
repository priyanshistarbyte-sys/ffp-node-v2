const express = require('express');
const router =  express.Router();

var profile = require('@/controllers/user-profile');

router.post('/update-user-profile',profile.updateProfile);
router.post('/get-user-profile',profile.getUserProfile);
router.post('/upload-logo',profile.uploadLogo);

module.exports = router;
