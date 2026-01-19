const express = require('express');
const router =  express.Router();

var settings = require('@/controllers/user-settings');

router.post('/change-password',settings.changePassword);
router.post('/delete-account',settings.deleteAccount);
router.post('/add-complain',settings.addComplain);
router.post('/get-user-complains',settings.getUserComplains);
router.post('/user-feedback',settings.submitUserFeedback);
router.post('/save-user-post',settings.saveUserPost);
router.post('/make-post-by-user',settings.makeUserPost); 

router.post('/apply-coupon-code',settings.applyCouponCode);


module.exports = router;
