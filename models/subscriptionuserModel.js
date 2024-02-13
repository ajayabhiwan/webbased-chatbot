const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const keysecrect = "thisismysecrectcodehaveyouenjoy";
const SubscriptionUserModel = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        trim:true
    },
    Lastname:{
        type:String,
        trim:true
    },
    roles: {
        type: [String],
        enum: ["user", "admin"],
        default: ["user"],
    },
    Email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid Email ID")
            }
        }
    },
    Password :{
        type:String,
        required:true,
        min:4
    },
    is_verify: {
        type: Boolean,
        default: false
    },
   
    reset_password_request:{
        type: String,
    },
    character:{
        type:"String",
        enum : ["character1","character2","character3","character4","character5"]
    },
    tokens : [
        {
            token :{
                type:String,
                required:true
            }
        }
    ]
   
   
},{ timestamps: true });


SubscriptionUserModel.methods.generateAuthtoken = async function(req,res){
    try {
        let token = jwt.sign({_id:this._id,roles:this.roles},keysecrect,{
            expiresIn:"12d"
        });

        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token
    } catch (error) {
        res.status(422).json(error);
        console.log(error)
    }
}

module.exports = new mongoose.model('subcriptionuser',SubscriptionUserModel);