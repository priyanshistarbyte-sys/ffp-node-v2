const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var authentication = require('@/controllers/authentication');
const sms_helper = require('@/helper/sms-helper');

router.post('/login',authentication.userLogin);
router.post('/forgot-register-send-otp',authentication.forgotRegisterSendOTP);
router.post('/update-password',authentication.updatePassword);
router.post('/user-register',authentication.userRegister);


module.exports = router;
