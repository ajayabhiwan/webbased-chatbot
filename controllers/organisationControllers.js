const Organisationdata = require("../models/organisationModel");

const insertdata = async(req,res)=>{
    try {

         let pdfs = null;
            let images = null;
            let document = null ;
            
        if(req.files.images) {
            images = req.files.images[0].filename;
             
         }
         if(req.files.pdfs) {
             pdfs = req.files.pdfs[0].filename;
             
         }
 
         if(req.files.document){
             document = req.files.document[0].filename
         }
        
         const data = new Organisationdata({
            
                images:images, 
                pdfs:pdfs,
                document:document
             
         })
 
         console.log("data value",data);
 
         const result = await data.save()
         console.log("result value --", result);
         return res.status(200).json({success:true ,message:"registered successfully",result })
         
        }
        
     catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}

module.exports = {
    insertdata 
}