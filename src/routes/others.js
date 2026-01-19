const express = require('express');
const router =  express.Router();

var others = require('@/controllers/others');

const testController = require('@/controllers/test');

router.post('/get-subscription-plans',others.getSubscriptionPlanLists);
router.post('/get-faqs',others.getFAQs);
router.post('/daily-video-anylitics',others.setVideoAnylitics);
router.post('/get-notifications',others.getNotifications);

router.post('/test-file', testController.fileStore);

module.exports = router;
