const AdminUser = require("../models/subscriptionuserModel");

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
        const userId = req.params.id;
        console.log("userID",userId)

        const user = await AdminUser.findById({_id:userId});
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
        character1: "https://example.com/characters/character1",
        character2: "https://example.com/characters/character2",
        character3: "https://example.com/characters/character3",
        character4: "https://example.com/characters/character4",
        character5: "https://example.com/characters/character5",
    };
    return characterMappings[character] || "https://example.com/characters/default";
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

// 

module.exports = {
    ChooseCharacter,
    getChosenCharacterLink,
    userlistapi
}