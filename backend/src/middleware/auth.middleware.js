const jwt = require("jsonwebtoken");

const authenticate = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401)
      .json({

        success:false,

        message:
        "No token provided"

      });

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch(error){

    return res.status(401)
    .json({

      success:false,

      message:
      "Invalid token"

    });

  }

};

const authenticateStudent =
(
  req,
  res,
  next
)=>{

  if(
    req.user.role !==
    "student"
  ){

    return res.status(403)
    .json({

      success:false,

      message:
      "Student only"

    });

  }

  next();

};

const authenticateAdmin =
(
  req,
  res,
  next
)=>{

  if(
    req.user.role !==
    "admin"
  ){

    return res.status(403)
    .json({

      success:false,

      message:
      "Admin only"

    });

  }

  next();

};

module.exports = {

  authenticate,

  authenticateStudent,

  authenticateAdmin

};