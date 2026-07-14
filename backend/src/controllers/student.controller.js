const Student = require("../models/Student");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const { getIO } = require("../socket");
const Submission = require(
  "../models/Submission"
);
const bcrypt = require("bcryptjs");
const {
 createActivity
} = require(
 "../services/activity.service"
);





/*
|--------------------------------------------------------------------------
| CREATE STUDENT (ADMIN)
|--------------------------------------------------------------------------
*/

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      batchYear,
      studentNumber,
      password,
    } = req.body;

    const rollNo = `CITN/${batchYear}/${studentNumber}`;

    const existingStudent = await Student.findOne({
      $or: [
        { rollNo },
        { email }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const student = await Student.create({
      name,
      email,
      rollNo,
      batchYear,
      studentNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.error("Create Student Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| JOIN SESSION (JWT Protected)
|--------------------------------------------------------------------------
*/

const joinStudent = async (req, res) => {
  try {

    const { sessionCode } = req.body;

    const session =
      await Session.findOne({
        code: sessionCode,
        isActive: true,
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const student =
      await Student.findById(
        req.user.id
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.sessionId =
      session._id;

    await student.save();

    const existingAttendance =
      await Attendance.findOne({
        sessionId: session._id,
        studentId: student._id,
      });

    if (!existingAttendance) {

      await Attendance.create({
        sessionId: session._id,
        studentId: student._id,
      });

    }

    /*
    |--------------------------------------------------------------------------
    | Activity Feed
    |--------------------------------------------------------------------------
    */

    await createActivity(

      session._id,

      "student_joined",

      `${student.name} joined session`,

      student.rollNo

    );

    /*
    |--------------------------------------------------------------------------
    | Socket Event
    |--------------------------------------------------------------------------
    */

    const io = getIO();

    io.to(session.code).emit(
      "student_joined",
      {
        studentId:
          student._id,

        name:
          student.name,

        rollNo:
          student.rollNo,

        sessionId:
          session._id,

        joinedAt:
          new Date(),
      }
    );

    return res.status(200).json({

      success: true,

      message:
        "Student joined successfully",

      student: {

        id:
          student._id,

        name:
          student.name,

        rollNo:
          student.rollNo,

      },

      session,

    });

  } catch (error) {

    console.error(
      "Join Student Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }
};

const getStudents = async (
 req,
 res
) => {

 try {

  const students =
   await Student.find()
   .sort({
    createdAt:-1
   });

  return res.json({

   success:true,

   total:
   students.length,

   students

  });

 } catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

const getStudentById =
async (
 req,
 res
) => {

 try {

  const student =
   await Student.findById(
    req.params.id
   );

  if(!student){

   return res.status(404)
   .json({

    success:false,

    message:
    "Student not found"

   });

  }

  return res.json({

   success:true,

   student

  });

 } catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

const updateStudent =
async (
 req,
 res
) => {

 try {

  const {
   name,
   email
  } = req.body;

  const student =
   await Student.findByIdAndUpdate(

    req.params.id,

    {
     name,
     email
    },

    {
     new:true
    }

   );

  if(!student){

   return res.status(404)
   .json({

    success:false,

    message:
    "Student not found"

   });

  }

  return res.json({

   success:true,

   student

  });

 } catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

}; 


const deleteStudent =
async (
 req,
 res
) => {

 try {

  const student =
   await Student.findById(
    req.params.id
   );

  if(!student){

   return res.status(404)
   .json({

    success:false,

    message:
    "Student not found"

   });

  }

  await Student.findByIdAndDelete(
   req.params.id
  );

  return res.json({

   success:true,

   message:
   "Student deleted"

  });

 } catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

const getMySessions = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      studentId: req.user.id,
    })
      .populate("sessionId")
      .sort({
        createdAt: -1,
      });

    const sessions = attendance
      .filter((item) => item.sessionId)
      .map((item) => ({
        attendanceId: item._id,
        joinedAt: item.joinedAt,
        session: item.sessionId,
      }));

    return res.json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStudentsWithStats =
async (req,res)=>{
  try {

    const students =
      await Student.find()
      .sort({
        createdAt:-1
      });

    const result = [];

    for(const student of students){

      const attendanceCount =
        await Attendance.countDocuments({
          studentId:student._id
        });

      const submissions =
        await Submission.find({
          studentId:student._id,
          status:"evaluated"
        });

      const totalScore =
        submissions.reduce(
          (sum,item)=>
            sum + (item.score || 0),
          0
        );

      result.push({
        _id:student._id,
        name:student.name,
        rollNo:student.rollNo,
        email:student.email,
        sessionsJoined:
          attendanceCount,
        attendance:
          attendanceCount,
        totalScore
      });

    }

    return res.json({
      success:true,
      total:result.length,
      students:result
    });

  } catch(error){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

module.exports = {

 createStudent,

 joinStudent,

 getStudents,

 getStudentById,

 updateStudent,

 deleteStudent,

  getMySessions,

  getAllStudentsWithStats,
};