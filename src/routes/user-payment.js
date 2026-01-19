const express = require('express');
const router =  express.Router();


var payment = require('@/controllers/user-payment');

router.post('/user-purchase-package',payment.userPurchasePackage);

module.exports = router;
