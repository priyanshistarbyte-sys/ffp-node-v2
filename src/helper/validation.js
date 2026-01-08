
const { ffp_send_response } = require("./security")


const validate =  (requestedFields, requeiredFields) => {
    let fields  = requeiredFields.split(',');
    let errors = [];
    fields?.forEach(element => {
        if(element=="user_id_not_0"){
            if(!(parseInt(requestedFields['user_id']) > 0)){
                errors.push('User Id must be grater then 0');
            }
        }else if(element=="user_id"){
            if(requestedFields[element]==undefined){
                errors.push('User Id must be required');
            }
        }else{
            if(requestedFields[element]==undefined || requestedFields[element]=="" ){
                let fieldName = element.charAt(0).toUpperCase() + element.slice(1);
                fieldName = fieldName.replace("_"," ");
                errors.push(fieldName+' field must be required');
            }
        }
    });

    return errors;
};

const errorMessage = (req, res, errors) => {
   return res.send(ffp_send_response(req,{
        "status":false,
        "message": errors.join(', '),
        "data":[]
    }));
}

const errorMessageWithMessage = (req, res, message) => {
    return res.send(ffp_send_response(req,{
         "status":false,
         "message": message,
         "data":[]
     }));
 }

module.exports =  {
    validate,
    errorMessage,
    errorMessageWithMessage
}