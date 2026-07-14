const fs = require("fs");
const Submission = require(
  "../models/Submission"
);
const Student = require(
  "../models/Student"
);

const Notification =
require(
 "../models/Notification"
);

const {
 createActivity
} = require(
 "../services/activity.service"
);

const Task = require(
  "../models/Task"
);

const Evaluation = require(
  "../models/Evaluation"
);

const { getIO } = require(
  "../socket"
);

const {
  readFileContent,
} = require(
  "../services/file.service"
);

const {
  evaluateSubmission,
} = require(
  "../services/openrouter.service"
);

const uploadSubmission =
async (
  req,
  res
) => {

  try {

    const { taskId } =
      req.body;

    const studentId =
      req.user.id;

    if (!req.file) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "File required",
        });

    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Student & Task
    |--------------------------------------------------------------------------
    */

    const student =
      await Student.findById(
        studentId
      );

    if (!student) {

      return res
        .status(404)
        .json({

          success:false,

          message:
          "Student not found"

        });

    }

    const task =
      await Task.findById(
        taskId
      );

    if (!task) {

      return res
        .status(404)
        .json({

          success:false,

          message:
          "Task not found"

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Create Submission
    |--------------------------------------------------------------------------
    */

    const submission =
      await Submission.create({

        studentId,

        taskId,

        sessionId:
          task.sessionId,

        fileName:
          req.file.originalname,

        filePath:
          req.file.path,

        fileType:
          req.file.mimetype,

      });

    /*
    |--------------------------------------------------------------------------
    | Read Code
    |--------------------------------------------------------------------------
    */

    const code =
      readFileContent(
        req.file.path
      );

    /*
    |--------------------------------------------------------------------------
    | AI Evaluation
    |--------------------------------------------------------------------------
    */

    let parsed;

    try {

      const aiResponse =
        await evaluateSubmission(

          `
Task Title:
${task.title}

Instructions:
${task.instructions}

Expected Output:
${task.expectedOutput || ""}

Evaluation Criteria:
${task.evaluationCriteria || ""}

Max Score:
${task.maxScore || 100}
`,

          code

        );

      parsed =
        JSON.parse(
          aiResponse
        );

    } catch (error) {

      console.log(
        "AI Evaluation Failed"
      );

      parsed = {

        score: 50,

        strengths: [
          "Submission received"
        ],

        mistakes: [],

        feedback:
          "AI evaluation pending"

      };

    }

    /*
    |--------------------------------------------------------------------------
    | Save Evaluation
    |--------------------------------------------------------------------------
    */

    const evaluation =
      await Evaluation.create({

        submissionId:
          submission._id,

        score:
          parsed.score,

        strengths:
          parsed.strengths || [],

        mistakes:
          parsed.mistakes || [],

        feedback:
          parsed.feedback || "",

        aiModel:
          "deepseek",

      });

    /*
    |--------------------------------------------------------------------------
    | Update Submission
    |--------------------------------------------------------------------------
    */

    submission.score =
      parsed.score;

    submission.feedback =
      parsed.feedback;

    submission.status =
      "evaluated";

    await submission.save();

    /*
    |--------------------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------------------
    */

    await Notification.create({

      sessionId:
        task.sessionId,

      title:
        "Submission Evaluated",

      message:
        `${student.name} scored ${parsed.score}`,

      type:
        "evaluation"

    });

    /*
    |--------------------------------------------------------------------------
    | Activity Feed
    |--------------------------------------------------------------------------
    */

    await createActivity(

      task.sessionId,

      "evaluation_completed",

      `${student.name} scored ${parsed.score}`,

      parsed.feedback

    );

    /*
    |--------------------------------------------------------------------------
    | Realtime Event
    |--------------------------------------------------------------------------
    */

    try {

      const io =
        getIO();

      io.to(
        task.sessionId.toString()
      ).emit(
        "evaluation_completed",
        {

          studentId:
            student._id,

          studentName:
            student.name,

          taskId,

          score:
            parsed.score,

          feedback:
            parsed.feedback,

        }
      );

    } catch (socketError) {

      console.error(
        "Socket Error:",
        socketError.message
      );

    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res
      .status(201)
      .json({

        success: true,

        submission,

        evaluation,

      });

  } catch (error) {

    console.error(
      "Submission Error:",
      error
    );

    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message,

      });

  }

};

const getSessionSubmissions =
async (req,res)=>{

 try{

  const { sessionId } =
   req.params;

  const submissions =
   await Submission.find({

    studentId:
     req.user.id,

    sessionId

   })

   .populate(
    "taskId",
    "title"
   )

   .sort({
    createdAt:-1
   });

  return res.json({

   success:true,

   submissions

  });

 }catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

const viewSubmission =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const submission =
      await Submission.findById(
        id
      );

    if (!submission) {

      return res
        .status(404)
        .json({
          success:false,
          message:
          "Submission not found"
        });

    }

    const code =
      fs.readFileSync(
        submission.filePath,
        "utf8"
      );

    return res.json({

      success:true,

      submissionId:
      submission._id,

      fileName:
      submission.fileName,

      fileType:
      submission.fileType,

      code

    });

  } catch(error){

    console.error(error);

    return res
      .status(500)
      .json({

        success:false,

        message:
        error.message

      });

  }

};

const getMySubmissions =
async (req, res) => {

  try {

const studentId =
  req.user.id;

    const submissions =
      await Submission.find({

        studentId

      })

      .populate(
        "taskId",
        "title"
      )

      .sort({
        createdAt: -1
      });

    return res.json({

      success: true,

      submissions

    });

  } catch (error) {

    return res.status(500)
    .json({

      success: false,

      message:
        error.message

    });

  }

};


module.exports = {
  uploadSubmission,
  viewSubmission,
  getMySubmissions,
  getSessionSubmissions,
};