const Activity =
require("../models/Activity");

const { getIO } =
require("../socket");

const createActivity =
async (

 sessionId,

 type,

 title,

 description=""

)=>{

 const activity =
 await Activity.create({

  sessionId,

  type,

  title,

  description

 });

 try{

  const io =
   getIO();

  io.emit(
   "activity_created",
   activity
  );

 }catch{}

 return activity;

};

module.exports = {
 createActivity
};