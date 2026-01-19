const express = require('express');
const router =  express.Router();
const fs = require("fs").promises; 


router.post('/clear-cache',async function(req,res){
    try {
        await fs.unlink('./src/cache/cache.json');
        res.send({'status':true,'message':'Cache Cleaned'});
    } catch (error) {
        res.send({'status':false,'message':'Something error on delete, or file does not exist!'});
    }
});

module.exports = router;
