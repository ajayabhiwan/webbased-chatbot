const {check} = require("express-validator");

exports.signUpValidation = [
    check('images').custom((value,{req})=>{
        if(req.files.images[0].mimetype === 'image/jpeg' || req.files.images[0].mimetype === 'image/png'){
            return true
        } else{
            return false
        }
    }).withMessage('please upload a jpeg and png images'),

    check('pdfs').custom((value,{req})=>{
        if(req.files.pdfs[0].mimetype === 'application/pdf' || req.files.pdfs[0].mimetype === 'application/msword'){
            return true
        } else{
            return false
        }
    }).withMessage('please upload pdf and doc format'),
    check('document').custom((value,{req})=>{
        if(req.files.document[0].mimetype === 'application/vnd.ms-excel' || req.files.document[0].mimetype === 'application/xml'){
            return true
        } else{
            return false
        }
    }).withMessage('please upload ms-excel and xml format')
]

