const AdminUser = require("../models/userModel");
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer")
const keysecrect = "thisismysecrectcodehaveyouenjoy";

//////////////////////////////

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



const verifymail = async(req,res)=>{
    try {
       const updateinfo = await AdminUser.updateOne({_id: req.query.id},{$set:{is_verify:true}})
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

        const user = await AdminUser.findOne({ Email: Email });
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
                // if (user.is_verify === true) {
                    const token = await user.generateAuthtoken();
                   
                    console.log("token value ----", token);
                    // console.log("refresh token-- value--", refreshToken)
                    return res.status(200).json({
                        success: true,
                        token,
                        // refreshToken,
                        message: "Logged in successfully !",
                        user: user
                    });

                // } else {
                //     return res.status(200).json({ success: true, message: "this email id is not varified" });
                // }
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

        const preuserdata = await AdminUser.findOne({ Email: Email });
        console.log("preuserdata ----- value -", preuserdata);

        if (preuserdata) {
            const randomcode = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            console.log("randomcode value -----", randomcode)




            const otpExpiration = 2 * 60 * 1000; // 2 minutes
            console.log("otpexpriration --- value--", otpExpiration)
            const expirationTime = new Date(Date.now() + otpExpiration);
            console.log(" expirationTime--- value--", expirationTime);

            const user = await AdminUser.findOneAndUpdate({ Email: Email }, { $set: { reset_password_request: randomcode } }, { new: true })
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


















///////////////////////////////////////////

const ChooseCharacter = async(req,res)=>{
    try {
        const {Email,character} = req.body
       
        console.log("email  -  data -- ",req.body);
       const admindata = await AdminUser.findOne({Email:Email});
       console.log("ad,mindata ------",admindata);

       
       if (!admindata) {
        return res.status(400).json({ success: false, message: "User not found." });
    }

       // Check if the user has the 'admin' role
      if (!admindata.roles.includes("admin")) {
        return res.status(403).json({ success: false, message: "Only admin users are allowed to choose characters." });
      }


      admindata.character = character;
      const result = await admindata.save();
      console.log("result ---value---",result);
      return res.status(400).json({success:true , message:" Character chosen successfully" ,result});

   
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success:false , message:error.message});
    }
}

// get choose -character -link ------api----
const getChosenCharacterLink = async (req, res) => {
    try {
        const id = req.body.id;
        console.log("userID",id)

        const user = await AdminUser.findById({_id:id});
        console.log("user -----daetails--",user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const chosenCharacterLink = getCharacterLink(user.character);
        console.log("chosenCharacterLink",chosenCharacterLink)

        return res.status(200).json({ success: true, chosenCharacterLink });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getCharacterLink = (character) => {
    const characterMappings = {
        character1: "character1",
        character2: "character2",
        character3: "character3",
        character4: "character4",
        character5: "character5",
    };
    return characterMappings[character] 
};


/// userlist ------api ----

const userlistapi = async(req,res)=>{
    try {
        const roles = "user"
        console.log("roles---value-----",roles);
        const users = await AdminUser.find({roles:roles});
        console.log("users--value ----",users);

        if(!users){
            return res.status(400).json({ success: false, message:"no user data found" });
        }

        if(users){
            return res.status(200).json({ success: true, message:"all users data list found successfully" ,users});
        }
       
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
}

// ///////// uploadmedia--------

const uploadmedia = async(req,res)=>{
    try {
        const document = req.file.filename ; 
        console.log("document",document);
        const insertmedia = await AdminUser({document:document})
        console.log("insertmedia",insertmedia);
        return res.status(200).json({success:true,message:"file uploaded successfully"});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    loginuser,
    forgetpassword,
    emailpage,
    resetpassword,    
    verifymail,
    ChooseCharacter,
    getChosenCharacterLink,
    userlistapi,
    uploadmedia
}