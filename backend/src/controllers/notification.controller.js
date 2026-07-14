const Notification =
require("../models/Notification");

const Session =
require("../models/Session");

const { getIO } =
require("../socket");

/*
|--------------------------------------------------------------------------
| Send Notification
|--------------------------------------------------------------------------
*/

const sendNotification =
async (req,res)=>{

 try{

  const {
   sessionCode,
   title,
   message,
   type
  } = req.body;

  const session =
   await Session.findOne({
    code:sessionCode
   });

  if(!session){

   return res.status(404)
   .json({
    success:false,
    message:"Session not found"
   });

  }

  const notification =
   await Notification.create({

    sessionId:
    session._id,

    title,

    message,

    type

   });

   const {
 createActivity
} = require(
 "../services/activity.service"
);

await createActivity(

 session._id,

 "notification",

 title,

 message

);

  const io =
   getIO();

  io.to(sessionCode)
  .emit(
   "notification_received",
   notification
  );

  return res.status(201)
  .json({

   success:true,

   notification

  });

 }catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

/*
|--------------------------------------------------------------------------
| Get Notifications
|--------------------------------------------------------------------------
*/

const getNotifications =
async (req,res)=>{

 try{

  const { sessionId } =
   req.params;

  const notifications =
   await Notification.find({
    sessionId
   })
   .sort({
    createdAt:-1
   });

  return res.json({

   success:true,

   total:
   notifications.length,

   notifications

  });

 }catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

/*
|--------------------------------------------------------------------------
| Mark Read
|--------------------------------------------------------------------------
*/

const markRead =
async (req,res)=>{

 try{

  const notification =
   await Notification.findByIdAndUpdate(

    req.params.id,

    {
     isRead:true
    },

    {
     new:true
    }

   );

  return res.json({

   success:true,

   notification

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
 sendNotification,
 getNotifications,
 markRead
};