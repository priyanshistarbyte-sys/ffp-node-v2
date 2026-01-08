const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var frames = require('@/controllers/frames');


router.post('/get-frames',frames.getFrames);
router.post('/get-sub-frames',frames.getSubFrames);

module.exports = router;
