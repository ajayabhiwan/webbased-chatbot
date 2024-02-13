const express = require("express");
const AdminRoute = express();
const auth = require("../middleware/auth");
const AdminController = require("../controllers/adminController");

AdminRoute.use(express.json());
AdminRoute.use(express.urlencoded({extended:true}));

AdminRoute.post("/choosecharacter",AdminController.ChooseCharacter);
AdminRoute.get("/getchoosecharacter/:id",AdminController.getChosenCharacterLink);
AdminRoute.get("/userlist",auth,AdminController.userlistapi);
module.exports = AdminRoute

