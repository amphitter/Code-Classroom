const mongoose = require("mongoose");

const notificationSchema =
new mongoose.Schema({

  sessionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Session",
    required:true
  },

  title:{
    type:String,
    required:true
  },

  message:{
    type:String,
    required:true
  },

  type:{
    type:String,
    enum:[
      "announcement",
      "task",
      "evaluation",
      "system",
      "leaderboard"
    ],
    default:"announcement"
  },

  createdBy:{
    type:String,
    default:"admin"
  },

  isRead:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Notification",
  notificationSchema
);