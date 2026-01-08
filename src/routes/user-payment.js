const express = require('express');
const router =  express.Router();
const globalConfiguration = require('@/config/config');

var payment = require('@/controllers/'+globalConfiguration.api_version+'/user-payment');

router.post('/user-purchase-package',payment.userPurchasePackage);

module.exports = router;
