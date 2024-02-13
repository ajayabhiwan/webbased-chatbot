const SubscriptionUser = require("../models/subscriptionuserModel");
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer")
const keysecrect = "thisismysecrectcodehaveyouenjoy";
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const jwt = require("jsonwebtoken");
const subscriptionuserModel = require("../models/subscriptionuserModel");
const verifyToken = require('../middleware/authas');
const PROJECT = require("../models/projectModels");
const UploadDocument = require("../models/uploadDocumentModel")
const BlackList = require("../models/blacklistModel");
const ChatConversation = require("../models/chatconversationModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
// secured password ---- for paid user -----

const securedpassword = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10);
        console.log("passwordhash value ---- ", passwordhash);
        return passwordhash
    } catch (error) {
        console.log(error.message);

    }
}

// send verification mail --------
const sendVerifyMail = async (Email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {

                user: 'ajaysinghsri@gmail.com',
                pass: 'ugshdrbqmuprgqoq'
            }
        })
        const mailoption = {
            from: 'ajaysinghsri@gmail.com',
            to: Email,
            subject: "for verification mail",
            html: `<p>hello ${Email} please click here to <a href="http://127.0.0.1:5000/verify?id=${user_id}">verify</a> your email </p>`
        }

        transporter.sendMail(mailoption, (error, info) => {
            if (error) {
                console.log(error.message);
            } else {
                console.log("mail has been sent successfully ", info.response);
            }
        })



    } catch (error) {
        console.log(error.message)
    }
}

/// send reset password mail to change there password -----

const sendResetPasswordEmail = async (Email, id, expirationTime) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'ajaysinghsri@gmail.com',
            pass: 'ugshdrbqmuprgqoq'
        }
    });



    const mailOptions = {
        from: 'ajaysinghsri@gmail.com',
        to: Email,
        subject: 'Reset Password',
        html: `<p>Hii ${Email}, Please copy  the below link and <a href=http://localhost:5000/emailpage/${id}>reset password.</a> This link is valid for 2 minutes.${expirationTime} </p>`,


    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Mail has been sent:-", info.response);
        }
    });
};





/// registered subscription user -------

const registereduser = async (req, res) => {
    try {
        const { Name, Lastname, Email, Password ,chatId } = req.body;

        console.log("req-body - value", req.body);
        const spassword = await securedpassword(Password);

        if (!Name || !Email || !Password) {
            return res.status(400).json({ success: false, message: "please fill up all details" })
        }

        const preuser = await SubscriptionUser.findOne({ Email: Email });
        console.log("insertuser value ---- already exist ---", preuser);
        if (preuser) {

            console.log("user already exist with email id ", preuser);
            return res.status(400).json({ success: false, message: "user with given Email id already exist" });
        } else {

            const insertuser = new SubscriptionUser({
                Name: Name, Lastname: Lastname, Email: Email, Password: spassword , chatId :chatId
            });

            console.log("insertuser data --- value -----", insertuser);

            const result = await insertuser.save();
            sendVerifyMail(req.body.Email, result._id);
            console.log("result ----- value ----", result);

            return res.status(200).json({ success: true, message: "data registered successfully", result })


        }

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, message: error.message })
    }
}



///verifymail ------
const verifymail = async(req,res)=>{
    try {
       const updateinfo = await SubscriptionUser.updateOne({_id: req.query.id},{$set:{is_verify:true}})
       console.log(updateinfo);
       res.render("email-verified")
    } catch (error) {
       console.log(error.message);
       return res.status(400).json({success:false , message:error.message });
    }
 }


// login api of subscription user -------

const loginuser = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        console.log("loginuser value -----", req.body);

        const user = await SubscriptionUser.findOne({ Email: Email });
        console.log("login user email ---", user)

        if (!user) {
            console.log("invalid email id and password");
            return res.status(400).json({ success: false, message: "invalid email id and password" });
        } else {
            const passwordmatch = await bcrypt.compare(Password, user.Password);
            console.log("password match value-----", passwordmatch);
            if (!passwordmatch) {
                console.log("invalid emailid and password");
                return res.status(400).json({ success: false, message: "invalid email and password" });
            } else {
                if (user.is_verify === true) {
                    const token = await user.generateAuthtoken();
                    // const refreshToken = jwt.sign(
                    //     { _id: user._id, roles: user.roles },
                    //     keysecrect,
                    //     { expiresIn: "30d" }
                    // )
                    console.log("token value ----", token);
                    // console.log("refresh token-- value--", refreshToken)
                    return res.status(200).json({
                        success: true,
                        token,
                        // refreshToken,
                        message: "Logged in successfully !",
                        user: user
                    });

                } else {
                    return res.status(200).json({ success: true, message: "this email id is not varified" });
                }
            }
        }

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message })
    }
}


/// forget password ----- 

const forgetpassword = async (req, res) => {
    try {
        const Email = req.body.Email
        console.log("forget password email id ----", Email);

        const preuserdata = await SubscriptionUser.findOne({ Email: Email });
        console.log("preuserdata ----- value -", preuserdata);

        if (preuserdata) {
            const randomcode = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            console.log("randomcode value -----", randomcode)




            const otpExpiration = 2 * 60 * 1000; // 2 minutes
            console.log("otpexpriration --- value--", otpExpiration)
            const expirationTime = new Date(Date.now() + otpExpiration);
            console.log(" expirationTime--- value--", expirationTime);

            const user = await SubscriptionUser.findOneAndUpdate({ Email: Email }, { $set: { reset_password_request: randomcode } }, { new: true })
            console.log("randomcode user subscription value ----", user);
            sendResetPasswordEmail(preuserdata.Email, randomcode, expirationTime);
            return res.status(200).json({ success: true, message: "Reset password mail sent !", user: user });
        } else {
            return res.status(400).json({ sucess: true, message: "This email is not exists !" });
        }



    } catch (error) {
        console.log(error.message)
    }
}

//sendemailpage -----------

const emailpage = async (req, res) => {
    try {
        const reqdata = req.params.id
        console.log("reqdata of email page--", reqdata);
        const user = await SubscriptionUser.findOne({ reset_password_request: reqdata });
        console.log("find user of email page of reset password request- ", user);

        if (user) {
            return res.render("index")
        } else {
            res.status(400).json({ success: false, message: "there is no latest request for reset password !" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: true, message: error.message });
    }
}


/// reset password -------- for subscription user -------
const resetpassword = async (req, res) => {
    try {

        const id = req.params.id;

        console.log("forget password --- req .params value ----", id)

        const data = await SubscriptionUser.findOne({ reset_password_request: id });
        console.log("resetpassword data value -----", data);

        if (data) {
            const userfound = await SubscriptionUser.findOne({ _id: data._id });
            console.log("userfound of resetpassword ---", userfound);
            if (userfound) {
                if (userfound.reset_password_request != '') {
                    const password = req.body.password
                    const confirmpass = req.body.confirmpass
                    console.log("confirm password value ", confirmpass);
                    const resetpasswordhash = await securedpassword(password, 12);
                    console.log("reset-password hash ----", resetpasswordhash);

                    if (password === confirmpass) {
                        const userdata = await SubscriptionUser.findOneAndUpdate({ _id: data._id }, { $set: { Password: resetpasswordhash, reset_password_request: "" } }, { new: true })
                        console.log("userdata reset value ---  ", userdata)
                        return res.status(200).send({ success: true, message: "User password has been changed !" })
                    } else {
                        res.status(401).send({ success: false, message: "Confirm password are not same password !" })
                    }

                }
                else {
                    return res.status(401).send({ success: false, message: "You have already updated your password !" })
                }
            } else {
                return res.status(401).send({ success: false, message: "email not found" })
            }
        } else {
            return res.status(401).send({ success: false, message: "There is no letest request for reset password !" })
        }

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}


// Use the verifyRefreshToken function in the controller

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = await verifyRefreshToken(refreshToken);

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { _id: decoded._id, roles: decoded.roles },
            keysecrect,
            { expiresIn: "14m" }
        );

        return res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
};



///// projectlist model api create --------

const projectregistered = async(req,res)=>{
    try {
        const {subcription_ID , ProjectList} = req.body ;
        console.log("projjectregister value -----",req.body);

        const projectdata = new PROJECT({
            subcription_ID:subcription_ID,
            ProjectList:ProjectList
        })
        console.log("projectdata value ",projectdata);
        const result = await projectdata.save();
        return res.status(200).json({success:true,message:"projectlist registered successfully",result});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}


const getprojectlist = async(req,res)=>{
    try {
        const id = req.body.id
        console.log("req.body.PROJECT._id",id)
        console.log("projjectregister value -----",req.body.id);

        const getlistdata = await PROJECT.find({_id :id}).populate('subcription_ID');
        console.log("getlistdata-----",getlistdata)
        return res.status(200).json({success:true , message:"get all project list ---",getlistdata})
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}


/// upload  project ----- images and document ----- 

const uploadmediadata = async(req,res)=>{
    try {
        const ProjectList_Id = req.body.ProjectList_Id
        console.log("ProjectList_Id----",ProjectList_Id);
        
        // let images = null ;
        // let document = null;
        // let pdfs = null ;

        // if(req.files.images){
        //     images = req.files.images[0].filename
        //     console.log("images value --",images);

        // }

        // if(req.files.document){
        //     document = req.files.document[0].filename;
        //     console.log("document value --",document);
        // }
        // if(req.files.pdfs){
        //     pdfs = req.files.pdfs[0].filename;
        //     console.log("pdfs value --",document);
        // }

        const document = req.file.filename
        console.log("document value ----",document);
        const uploaddata = new UploadDocument({
            ProjectList_Id:ProjectList_Id,
            document:document

        })  
        console.log("uplopad datamedia value -----",uploaddata);

        const resultdata = await uploaddata.save();
        return res.status(200).json({success:true,message:"Media upload succesfully",resultdata});

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}

const getuploadmediadata = async(req,res)=>{
    try {
        const id = req.body.id 
        console.log("req.body",id);

        const preprojectlist = await UploadDocument.findOne({_id:id}).populate('ProjectList_Id');

        console.log("preprojectlist",preprojectlist);
        return res.status(200).json({success:true , message:"get-all-mediadata-value",preprojectlist});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false,message:error.message });
    }
}


//////logout api -------

const logoutapi = async(req,res)=>{
    try {
        let token =req.query.token|| req.body.token||req.headers.Authorization || req.headers.authorization;
        console.log("token value in blacklist -----",token);
        const bearertoken = token.split(" ")[1];
        console.log("bearer tokentoken value in blacklist -----",bearertoken);

        const newBlacklist = new BlackList({token:bearertoken});

        const result = await newBlacklist.save();

        console.log("result blacklist ---",result);
        res.setHeader('Clear-Site-Data','"cookies","storage"');
        return res.status(200).json({success:true , message:"you are logged out "})
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}




///chat conversation logic and api create ------

const savechatdata = async(req,res)=>{
    try {
        const { chatId  , message } = req.body;
        console.log("req.body value ---",req.body);

        const prechatuser = await ChatConversation.findOne({chatId:chatId});

        console.log("prechatuserdata -----",prechatuser);

        if(!prechatuser){
            const chat = new ChatConversation({
                chatId: chatId,
                message: message,
            });
            console.log("chatdetails",chat);
    
            const result = await chat.save();
    
            return res.status(201).json({ success: true, message: "Chat saved successfully." , result })
        }

        if(prechatuser){
            prechatuser.message.push(message);
            const result = await prechatuser.save();
    
            return res.status(201).json({ success: true, message: "Chat saved successfully in old user." , result })
        }

        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}


/// if both chatid will be match than give all chat to user for download ------

const matchchatiddata = async(req,res)=>{
    try {
        const {chatId,Email} = req.body
        console.log("chatId data ----value -----",chatId)
        const chatiddata = await ChatConversation.findOne({chatId:chatId});
        console.log("chatuserdata---value",chatiddata);

        const userchatiddata = await SubscriptionUser.findOne({Email:Email});
        console.log("chatuserdata---value",userchatiddata);

        if(chatiddata.chatId === userchatiddata.chatId){
            return res.status(200).json({success:true , message:"chatiddata and userchatiddata match successfully",chatiddata});
        }else{
            return res.status(400).json({success:false , message:"chatiddata and userchatiddata not  match "});
        }

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ success: false, message: "your are not authorize users" });
    }
}



/////// create pdf ------- of chat conversation -----
const createPDF = async (chatId) => {
    const pdfDoc = new PDFDocument();
    const filePath = `./public/${chatId}_chatbot_conversation.pdf`; // Change the file path accordingly

    pdfDoc.pipe(fs.createWriteStream(filePath));

    const chatMessages = await ChatConversation.find({ chatId: chatId });

    pdfDoc.fontSize(16).text("Chatbot Conversation", { align: "center" }).moveDown(0.5);

    chatMessages.forEach((msg) => {
        pdfDoc.fontSize(12).text(`[${msg.timestamp}] ${msg.message}`);
    });

    pdfDoc.end();

    return filePath;
};

////// doenload pdf ------

const downloadpdf = async(req,res)=>{
    try {
        const chatId = req.params.chatId;
        console.log("chatid --value --",chatId);


          // Create PDF and get the file path
          const filePath = await createPDF(chatId);
          console.log("filepath ----",filePath);

          // Stream the PDF as a response
          res.setHeader("Content-Disposition", `attachment; filename=${chatId}_chatbot_conversation.pdf`);
          res.setHeader("Content-Type", "application/pdf");
          fs.createReadStream(filePath).pipe(res);

        // Fetch chat messages from the database based on userId
        // const messages = await ChatConversation.find({ userId: userId });

        // if (messages.length === 0) {
        //     return res.status(404).json({ success: false, message: "No chat messages found." });
        // }

        // // Create PDF and get the file path
        // const filePath = createPDF(userId, messages);

        // // Stream the PDF as a response
        // res.setHeader("Content-Disposition", `attachment; filename=${userId}_chatbot_conversation.pdf`);
        // res.setHeader("Content-Type", "application/pdf");
        // fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.log(error.message);
       return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

// get all user details ------

const getalluser = async(req,res)=>{
    try {
        const getuserdata = await subscriptionuserModel.find({});
        console.log("getuserdata ---details",getuserdata);

        return res.status(200).json({success:true , message:"get all user-details ",getuserdata});
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    registereduser,
    loginuser,
    forgetpassword,
    emailpage,
    resetpassword,    
    refreshToken,
    verifymail,
    projectregistered,
    getprojectlist,
    uploadmediadata,
    getuploadmediadata,
    logoutapi,
    savechatdata,
    downloadpdf,
    getalluser,
    matchchatiddata,
}
