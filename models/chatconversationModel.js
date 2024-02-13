const mongoose = require("mongoose");

const ChatConversationSchema = new mongoose.Schema({
   user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subcriptionuser'
   },
    chatId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    message: [{
        user :{
            type:String,
            
        },
        ai :{
            type:String,
        }
    }],
});

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);