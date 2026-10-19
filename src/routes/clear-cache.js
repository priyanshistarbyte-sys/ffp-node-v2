const express = require('express');
const router =  express.Router();
const fs = require("fs").promises; 
const path = require("path");
const cachePath = path.join(__dirname, "../cache/cache.json");
const cacheManager = require('@/helper/cache-manager');

router.post('/clear-cache',async function(req,res){
    try {
        await fs.unlink(cachePath);
        cacheManager.clearMemoryCache();
        res.send({'status':true,'message':'Cache Cleaned'});
    } catch (error) {
        res.send({'status':false,'message':'Something error on delete, or file does not exist!'});
    }
});

module.exports = router;
