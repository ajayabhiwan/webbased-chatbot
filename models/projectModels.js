const mongoose = require("mongoose");

const ProjectListSchema = new mongoose.Schema({
    subcription_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcriptionuser'
    },
    ProjectList: [{
        Project_ID: {
            type: Number
        },
        Project_Name: {
            type: String
        },
        Project_type_Name: {
            type: String
        },
        Project_Domain_Name: {
            type: String
        },
        Project_Status: {
            type: Boolean
        },
        Project_Address: {
            type: String
        }
       
    }]
}, { timestamps: true });

module.exports = new mongoose.model("projectlist", ProjectListSchema);