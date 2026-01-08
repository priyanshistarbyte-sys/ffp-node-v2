const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var profile = require('@/controllers/'+globalConfiguration.api_version+'/user-profile');

router.post('/update-user-profile',profile.updateProfile);
router.post('/get-user-profile',profile.getUserProfile);
router.post('/upload-logo',profile.uploadLogo);

module.exports = router;
