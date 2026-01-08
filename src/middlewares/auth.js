const globalConfiguration = require('@/config/config');
const securityHelper = require('@/helper/security');
const jwt = require('jsonwebtoken');
const authenticateJWT = (req, res, next) => {

    console.log("\n\n----------------------------------------------------------------------------------------");
    console.log("API URL",req.path);

    var request_body = securityHelper.ffp_request_decode(req);
    /* Exclude auth on specific route */
    if(globalConfiguration.ignore_auth_urls.includes(req.path)){

        /* Every request device id must required */
        if(request_body.device_id==undefined){
            var responseJson = {
                status : false,
                message : 'Device id must be required on every request!'
            }
            res.send(securityHelper.ffp_send_response(req,responseJson));
        }
        req.body = request_body;
        next();
    }else{

        if(request_body.error=="true" || request_body.error==true){
            console.log('request_body',request_body.error);
            res.send(securityHelper.ffp_send_response(req,{ status:false, message:request_body.message }));
            return true;
        }

        const authHeader = req.headers.authorization;
        // console.log(authHeader);
        if (authHeader!=undefined && authHeader!="") {
            const token = authHeader.split(' ')[1];
    
            jwt.verify(token, globalConfiguration.jwt_secret, (err, token_data) => {

                var isError = false;
                /* If token invalid or expired */
                if (err) {
                    isError = true;
                    var responseJson = {
                        status : false,
                        message : 'Token Invalid or expired!'
                    }
                    res.send(securityHelper.ffp_send_response(req,responseJson));
                    return true;
                }else{
                    /* If try token with different device for access this api */
                    // || token_data.user_id==undefined || token_data.user_id!=request_body.body.user_id
                    /* Get User */
                    if(request_body.user_id=="" || request_body.user_id==undefined || request_body.user_id=="0"){
                        request_body.user_id = 0;
                    }
                    if(token_data.user_id=="" || token_data.user_id==undefined || token_data.user_id=="0"){
                        token_data.user_id = 0;
                    }

                    /* Ignore User Id */
                    if(req.path.includes('/login') || req.path.includes('/forgot-register-send-otp')){
                        if(request_body.device_id==undefined || token_data.device_id==undefined || token_data.device_id!=request_body.device_id){
                            isError = true;
                            var responseJson = {
                                status : false,
                                message : 'Your token is not verified, Please login again!'
                            }
                            res.send(securityHelper.ffp_send_response(req,responseJson));
                            return true;
                        }
                    }else{
                        if(token_data.device_id!=request_body.device_id || token_data.user_id==undefined || parseInt(token_data.user_id)!=parseInt(request_body.user_id)){
                            isError = true;
                            var responseJson = {
                                status : false,
                                message : 'Your token is not verified, Please login again!'
                            }
                            res.send(securityHelper.ffp_send_response(req,responseJson));
                            return true;
                        }
                    }

                    if(isError==false){
                        req.body = request_body;
                        next();
                    }
                }
                
            });
        } else {
            /* If not passed bearer token in header */
            var responseJson = {
                status : false,
                message : 'Token must be required to access the apis!'
            }
            res.send(securityHelper.ffp_send_response(req,responseJson));
        }
    }
 }

 module.exports = authenticateJWT;