const express = require('express');
const router =  express.Router();

router.use('/v2',require('./global-setting'));
router.use('/v2',require('./posts'));
router.use('/v2',require('./categories'));
router.use('/v2',require('./frames'));
router.use('/v2',require('./status'));
router.use('/v2',require('./family'));
router.use('/v2',require('./authentication'));
router.use('/v2',require('./user-profile'));
router.use('/v2',require('./others'));
router.use('/v2',require('./user-settings'));
router.use('/v2',require('./user-payment'));

router.use('/v2',require('./clear-cache'));

module.exports = router;
