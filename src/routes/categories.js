const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var categories = require('@/controllers/categories');


router.post('/category-wise-post-data',categories.getCategoryWisePostSubCatData);
router.post('/get-categories',categories.getAllCategories);
router.post('/get-sub-categories',categories.getSubCategories);

module.exports = router;

