const Activity =
require("../models/Activity");

const getActivities =
async (req,res)=>{

 try{

  const { sessionId } =
   req.params;

  const activities =
   await Activity.find({
    sessionId
   })
   .sort({
    createdAt:-1
   })
   .limit(100);

  return res.json({

   success:true,

   activities

  });

 }catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

module.exports = {
 getActivities
};