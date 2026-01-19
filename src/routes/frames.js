const express = require('express');
const router =  express.Router();

var frames = require('@/controllers/frames');


router.post('/get-frames',frames.getFrames);
router.post('/get-sub-frames',frames.getSubFrames);

module.exports = router;
