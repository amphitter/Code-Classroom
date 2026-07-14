const Task = require("../models/Task");
const Session = require("../models/Session");
const { getIO } = require("../socket");
const Submission = require(
  "../models/Submission"
);
const {
  createActivity,
} = require(
  "../services/activity.service"
);
const Student = require(
  "../models/Student"
);

const Evaluation = require(
  "../models/Evaluation"
);





const createTask = async (
  req,
  res
) => {

  try {

    const {
      sessionCode,
      title,
      instructions,
      starterCode,
      deadline,
      evaluationCriteria,
      expectedOutput,
      maxScore
    } = req.body;

    const session =
      await Session.findOne({
        code: sessionCode,
      });

    if (!session) {

      return res.status(404)
      .json({

        success:false,

        message:
        "Session not found"

      });

    }

    const task =
      await Task.create({

        sessionId:
          session._id,

        title,

        instructions,

        starterCode,

        deadline,

        evaluationCriteria,

        expectedOutput,

        maxScore

      });

    /*
    |--------------------------------------------------------------------------
    | Activity Feed
    |--------------------------------------------------------------------------
    */

    await createActivity(

      session._id,

      "task_created",

      `Task Created: ${task.title}`,

      "Teacher created new task"

    );

    /*
    |--------------------------------------------------------------------------
    | Socket Broadcast
    |--------------------------------------------------------------------------
    */

    const io =
      getIO();

    io.to(sessionCode)
    .emit(
      "task_created",
      task
    );

    io.to(sessionCode)
    .emit(
      "activity_created",
      {

        type:
          "task_created",

        title:
          `Task Created: ${task.title}`

      }
    );

    return res.status(201)
    .json({

      success:true,

      task

    });

  } catch(error){

    console.error(error);

    return res.status(500)
    .json({

      success:false,

      message:
      error.message

    });

  }

};

const getTaskSubmissions =
async (req, res) => {

  try {

    const { taskId } =
      req.params;

    const submissions =
      await Submission.find({
        taskId
      })
      .populate(
        "studentId",
        "name rollNo email"
      )
      .sort({
        createdAt: -1
      });

    const results =
      await Promise.all(

        submissions.map(
          async (
            submission
          ) => {

            const evaluation =
              await Evaluation.findOne({

                submissionId:
                  submission._id

              });

            return {

              submissionId:
                submission._id,

              student:
                submission.studentId,

              fileName:
                submission.fileName,

              status:
                submission.status,

              submittedAt:
                submission.createdAt,

              score:
                evaluation?.score || 0,

              feedback:
                evaluation?.feedback || "",

            };

          }
        )
      );

    return res.json({

      success: true,

      total:
        results.length,

      submissions:
        results

    });

  } catch (error) {

    console.error(error);

    return res.status(500)
    .json({

      success:false,

      message:
        error.message

    });

  }

};

const getSessionTasks = async (
 req,
 res
) => {

 try {

  const tasks =
   await Task.find({

    sessionId:
    req.params.sessionId

   })
   .sort({
    createdAt:-1
   });

  return res.json({

   success:true,

   tasks

  });

 } catch(error){

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

module.exports = {
  createTask,
  getTaskSubmissions,
  getSessionTasks
};