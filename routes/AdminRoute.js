const express = require("express");
const AdminRoute = express();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const AdminController = require("../controllers/adminController");


AdminRoute.use(express.json());
AdminRoute.use(express.urlencoded({extended:true}));
AdminRoute.use(express.static("./public"))


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

AdminRoute.use(express.json());
AdminRoute.use(express.urlencoded({extended:true}));

AdminRoute.set("view engine",'ejs');
AdminRoute.set("views","./views/ejs");
////////
AdminRoute.get("/verify",AdminController.verifymail);
AdminRoute.post("/loginuser",AdminController.loginuser);
AdminRoute.post("/forgetpassword",AdminController.forgetpassword);

AdminRoute.get("/emailpage/:id",AdminController.emailpage);
AdminRoute.post("/emailpage/:id",AdminController.resetpassword);



//////
AdminRoute.post("/choosecharacter",auth,AdminController.ChooseCharacter);
AdminRoute.get("/getchoosecharacter",auth,AdminController.getChosenCharacterLink);
AdminRoute.get("/userlist",auth,AdminController.userlistapi);
AdminRoute.post("/uploadcsv",auth,upload.single('document'),auth,AdminController.uploadmedia);
module.exports = AdminRoute

