const express = require("express");
const UserRoute = express();
const UserController = require("../controllers/userController");
const multer = require("multer");
const path = require("path")
UserRoute.use(express.json());
UserRoute.use(express.urlencoded({extended:true}));
UserRoute.use(express.static("./public"))

const auth = require("../middleware/auth");


const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,"../public/documents"));
  }  ,
  filename:(req,file,cb)=>{
    const name = Date.now()+"-"+file.originalname;
    cb(null,name);

  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};


const upload = multer({storage:storage  ,fileFilter: fileFilter });

// const storage = multer.diskStorage({
//     destination:function(req,file,cb){
//         if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
//             cb(null ,path.join(__dirname,'../public/images'));
//         }else if(file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/xml'){
//             cb(null , path.join(__dirname,"../public/documents"));
//         }
//         else{
//             cb(null , path.join(__dirname,'../public/pdfs'));
//         }
//     },
//     filename : function(req,file,cb){
//         const name = Date.now()+""+file.originalname;
//         cb(null,name);
//     }
// });

// const filefilter = (req,file,cb)=>{
//     if(file.fieldname ==='images'){
//         (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')? cb(null,true) : cb(null,false);
//     }else if (file.fieldname ==='pdfs'){
//         (file.mimetype === 'application/msword' || file.mimetype === 'application/pdf')?cb(null,true):cb(null,false);
//     }else if(file.fieldname === 'document'){
//         (file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/xml')?cb(null,true):cb(null,false);
//     }
// }

// const upload = multer({storage:storage,fileFilter:filefilter}).fields([{name:'images' , maxCount:1},{name:'pdfs' , maxCount:1},{name:'document' , maxCount:1}])

const {signUpValidation} = require("../helpers/validation");

// subscriptionUserRoute.set("view engine",'hbs');
// subscriptionUserRoute.set("views","./views/hbs");


UserRoute.set("view engine",'ejs');
UserRoute.set("views","./views/ejs");

UserRoute.post("/registeruser",UserController.registereduser);
// subscriptionUserRoute.get("/users",subscriptionUserController.getalluser);
// subscriptionUserRoute.get("/verify",subscriptionUserController.verifymail);
// subscriptionUserRoute.post("/loginuser",subscriptionUserController.loginuser);
// subscriptionUserRoute.post("/forgetpassword",subscriptionUserController.forgetpassword);

// subscriptionUserRoute.get("/emailpage/:id",subscriptionUserController.emailpage);
// subscriptionUserRoute.post("/emailpage/:id",subscriptionUserController.resetpassword);


// subscriptionUserRoute.post("/refreshtoken",subscriptionUserController.refreshToken);
// subscriptionUserRoute.post("/postproject",auth,subscriptionUserController.projectregistered);
// subscriptionUserRoute.get("/getprojectlist",auth,subscriptionUserController.getprojectlist);
// subscriptionUserRoute.post("/uploadmedia",auth,upload.single('document'),subscriptionUserController.uploadmediadata);
// subscriptionUserRoute.get("/getmediadata",auth , subscriptionUserController.getuploadmediadata);
UserRoute.post("/savechat",UserController.savechatdata);
UserRoute.get("/chatidmatch",UserController.matchchatiddata);
UserRoute.get("/downloadPDF",UserController.downloadpdf);
// subscriptionUserRoute.post("/logout",auth,subscriptionUserController.logoutapi);



module.exports = UserRoute;