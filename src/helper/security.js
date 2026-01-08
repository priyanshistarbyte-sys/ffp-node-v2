const globalConfiguration = require('../config/config');
const crypto = require("crypto");

// https://nodeblogger.com/aes-encryption-decryption-in-node-js/
// https://cryptotools.net/rsagen
// https://medium.com/mindorks/how-to-pass-large-data-between-server-and-client-android-securely-345fed551651
// https://github.com/weblab-technology/rsa-aes-client-server-encryption-nodejs-example/blob/master/components/rsa-wrapper.js

exports.ffp_send_response = (req,responseJson) => {
    var is_secure_body = globalConfiguration.is_secure_body;
    if(req.headers.devicedetails!=undefined){
        var deviceDetails = JSON.parse(req.headers.devicedetails);
        if(deviceDetails.osVersion <= globalConfiguration.disable_encryption_in_os){
            is_secure_body = false;
        }
    }
    if(is_secure_body){
        var secret_key = globalConfiguration.aes_secret_key(32);
        const cipher = crypto.createCipheriv(globalConfiguration.security.algoritham, secret_key , Buffer.from(globalConfiguration.security.aes_iv, 'base64') );
        const encrypted = Buffer.concat([cipher.update(JSON.stringify(responseJson)), cipher.final()]);

        var app_public = globalConfiguration.security.app_public_key;
        var encrypted_secret_key = crypto.publicEncrypt({
            key: app_public,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(secret_key)).toString('base64');

        responseJson ={
            'data': encrypted.toString('base64'),
            'secret_key':encrypted_secret_key
        };
        // conso    le.log(responseJson);

        if(globalConfiguration.ignore_encryption.includes(req.path)){
            responseJson.is_secure_body = is_secure_body
        }


        var currentTime = new Date();
        var responseTime = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds()+'-------'+currentTime.getMilliseconds();
        console.log("User Response Time : "+responseTime);
        return responseJson;
    }else{
        if(globalConfiguration.ignore_encryption.includes(req.path)){
            responseJson.is_secure_body = is_secure_body
        }


        var currentTime = new Date();
        var responseTime = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds()+'-------'+currentTime.getMilliseconds();
        console.log("User Response Time : "+responseTime);
        return responseJson;
    }
};

exports.ffp_request_decode = function (req) {
    var requestBody = req.body;
    
    var is_secure_body = globalConfiguration.is_secure_body;
    if(req.headers.devicedetails!=undefined){
        var deviceDetails = JSON.parse(req.headers.devicedetails);
        if(deviceDetails.osVersion <= globalConfiguration.disable_encryption_in_os){
            is_secure_body = false;
        }
    }

    if(is_secure_body && !globalConfiguration.ignore_encryption.includes(req.path)){
        if(!req.body.payload && !req.body.secret_key){
            return { error : true, message:'Body Security Is Enabled, Now API Does Not Access Without Payload.' }
        }
        try{

            var secret_key = crypto.privateDecrypt({
                key: globalConfiguration.security.server_private_key,
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from(req.body.secret_key, 'base64'));
            // secret_key = secret_key.toString('base64');
            // console.log("Decoded Secret : ",secret_key);

            const decipher = crypto.createDecipheriv(globalConfiguration.security.algoritham, secret_key, Buffer.from(globalConfiguration.security.aes_iv, 'base64'));
            const decrpyted = Buffer.concat([decipher.update(req.body.payload, 'base64'), decipher.final()]);
            requestBody = JSON.parse(decrpyted);
            
            if(requestBody.user_id==""){
                requestBody.user_id = "0";
            }

            var currentTime = new Date();
            var responseTime = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds()+'-------'+currentTime.getMilliseconds();
            console.log("User Request : "+responseTime,requestBody);
            return requestBody;
        }catch(e){
            console.log(e);
            return { error : true, message:"Your encrption string is wrong : "+e }
        }
    }
    if(requestBody.user_id==""){
        requestBody.user_id = "0";
    }

    var currentTime = new Date();
    var responseTime = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds()+'-------'+currentTime.getMilliseconds();
    console.log("User Request : "+responseTime,requestBody);
    return requestBody;
};