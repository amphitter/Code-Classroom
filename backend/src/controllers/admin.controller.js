const jwt =
require("jsonwebtoken");

const adminLogin =
async (
 req,
 res
)=>{

 try{

  const {
   rollNo,
   password
  } = req.body;

  if(

   rollNo !==
   process.env.ADMIN_ROLL

  ){

   return res.status(401)
   .json({

    success:false,

    message:
    "Invalid credentials"

   });

  }

  if(

   password !==
   process.env.ADMIN_PASSWORD

  ){

   return res.status(401)
   .json({

    success:false,

    message:
    "Invalid credentials"

   });

  }

  const token =
   jwt.sign(

    {
     role:"admin",
     rollNo
    },

    process.env.JWT_SECRET,

    {
     expiresIn:"7d"
    }

   );

  return res.json({

   success:true,

   token,

   admin:{

    name:"Administrator",

    rollNo

   }

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
 adminLogin
};