const mongoose = require("mongoose");
const BlackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true
    }
},{timestamps:true});

module.exports = new mongoose.model('BlackList',BlackListSchema);