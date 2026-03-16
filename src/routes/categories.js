const express = require('express');
const router =  express.Router();

var categories = require('@/controllers/categories');


router.post('/category-wise-post-data',categories.getCategoryWisePostSubCatData);
router.post('/get-categories',categories.getAllCategories);
router.post('/get-sub-categories',categories.getSubCategories);
router.post('/search',categories.searchCategories);
router.post('/get-home-screen-data',categories.getHomeScreenData);

module.exports = router;

