const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var posts = require('@/controllers/posts');


router.post('/get-home-screen-data',posts.getHomeScreenData);
router.post('/get-today-special',posts.getTodayPosts);
router.post('/get-upcoming-posts',posts.getUpcomingPosts);


module.exports = router;
