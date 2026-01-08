const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var globalSetting = require('@/controllers/global-setting');

router.post('/global-setting',globalSetting.getGlobalSetting);
router.post('/sync-firebase-token',globalSetting.syncFirebaseToken);

module.exports = router;
