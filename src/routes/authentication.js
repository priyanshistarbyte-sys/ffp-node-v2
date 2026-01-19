const express = require('express');
const router =  express.Router();

var authentication = require('@/controllers/authentication');

router.post('/login',authentication.userLogin);
router.post('/forgot-register-send-otp',authentication.forgotRegisterSendOTP);
router.post('/update-password',authentication.updatePassword);
router.post('/user-register',authentication.userRegister);


module.exports = router;
