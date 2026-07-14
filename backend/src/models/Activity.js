const mongoose = require("mongoose");

const activitySchema =
new mongoose.Schema({

  sessionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Session",
    required:true
  },

  type:{
    type:String,
    enum:[
      "student_joined",
      "task_created",
      "submission_uploaded",
      "evaluation_completed",
      "leaderboard_updated",
      "presentation_started",
      "presentation_stopped"
    ],
    required:true
  },

  title:{
    type:String,
    required:true
  },

  description:{
    type:String,
    default:""
  }

},{
 timestamps:true
});

module.exports =
mongoose.model(
 "Activity",
 activitySchema
);