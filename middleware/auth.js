
const users = require("../models/subscriptionuserModel");
const keysecrect = "thisismysecrectcodehaveyouenjoy";
const jwt = require('jsonwebtoken');
const BlackList = require("../models/blacklistModel");



const auth = async(req,res,next)=>{
    try {
        let token =req.query.token|| req.body.token||req.headers.Authorization || req.headers.authorization;
       
        const bearertoken = token.split(" ")[1];
        console.log("verify -token in auth ----",bearertoken)

        const blacklistedtoken = await BlackList.findOne({token:bearertoken});
        if(blacklistedtoken){
            return res.status(400).json({success:false,message:"this session has expired  please try again"});
        }

        const verifytoken = jwt.verify(bearertoken,keysecrect);
        console.log("AUTH VERFIIED ", verifytoken)
       const rootuser = await users.findOne({_id:verifytoken._id});
       console.log("rootuser ------ value-------",rootuser);
       
       if(!rootuser){
        throw new Error("user not found")
       }
    
       req.token = token;

       console.log("reqtoken value",req.token)
       req.rootuser = rootuser;
       console.log("requser value",req.rootuser)
       req.userid = rootuser._id
       console.log("req----userid---- valueee",req.userid);
    
       next()
    
    } catch (error) {
       return res.status(401).json({success:false,message: error.message})
    }
    }
    
    module.exports = auth
