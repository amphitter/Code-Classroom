const mongoose = require("mongoose");

const evaluationSchema =
new mongoose.Schema({

 submissionId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Submission",
  required:true
 },

 score:{
  type:Number,
  required:true
 },

 strengths:[String],

 mistakes:[String],

 feedback:String,

 aiModel:String

},{
 timestamps:true
});

module.exports =
mongoose.model(
 "Evaluation",
 evaluationSchema
);