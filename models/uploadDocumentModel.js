const mongoose = require("mongoose");

const UploadDocumentSchema = new mongoose.Schema({
    ProjectList_Id : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'projectlist'
    },
    document:{
        type:String
    }
},{timestamps:true});

module.exports = new mongoose.model('upload',UploadDocumentSchema);