const {
  generateTask,
  evaluateSubmission,
  generateClassroomContent,
} = require(
  "../services/openrouter.service"
);
const Session = require("../models/Session");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { getIO } = require("../socket");

const generateAITask =
async (req, res) => {

  try {

    const {
      topic,
      level,
      duration,
    } = req.body;

    const result =
      await generateTask(
        topic,
        level,
        duration
      );

    return res.json({
      success: true,
      result,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }

};

/*
|--------------------------------------------------------------------------
| Evaluate Code
|--------------------------------------------------------------------------
*/

const evaluateCode =
async (req, res) => {

  try {

    const {
      taskDescription,
      code,
    } = req.body;

    const result =
      await evaluateSubmission(
        taskDescription,
        code
      );

    return res.json({
      success: true,
      result,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }

};

const generateClassroomAssistant =
async (req, res) => {

  try {

    const {
      topic,
      level,
      duration,
    } = req.body;

    const result =
      await generateClassroomContent(
        topic,
        level,
        duration
      );

    let parsed;

    try {

      parsed =
        JSON.parse(result);

    } catch {

      return res.status(500)
      .json({

        success:false,

        message:
        "Invalid AI JSON",

        raw:result

      });

    }

    return res.json({

      success:true,

      content:parsed

    });

  } catch(error){

    return res.status(500)
    .json({

      success:false,

      message:
      error.message

    });

  }

};

const startClassWithAI =
async (req, res) => {

  try {

    const {
      sessionCode,
      topic,
      level,
      duration,
    } = req.body;

    const session =
      await Session.findOne({
        code: sessionCode,
        isActive: true,
      });

    if (!session) {

      return res.status(404)
      .json({
        success:false,
        message:
        "Session not found"
      });

    }

    const aiResult =
      await generateClassroomContent(
        topic,
        level,
        duration
      );

    let content;

    try {

      content =
      JSON.parse(aiResult);

    } catch {

      return res.status(500)
      .json({
        success:false,
        message:
        "AI returned invalid JSON",
        raw:aiResult
      });

    }

    /*
    |--------------------------------------------------------------------------
    | Create Task
    |--------------------------------------------------------------------------
    */

    const task =
      await Task.create({

        sessionId:
          session._id,

        title:
          content.title,

        instructions:
          content.instructions,

        starterCode:
          content.starterCode,

        expectedOutput:
          content.expectedOutput,

        evaluationCriteria:
          content.evaluationCriteria,

      });

    /*
    |--------------------------------------------------------------------------
    | Create Notification
    |--------------------------------------------------------------------------
    */

    const notification =
      await Notification.create({

        sessionId:
          session._id,

        title:
          content.notificationTitle,

        message:
          content.notificationMessage,

        type:
          "task"

      });

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
      "notification_received",
      notification
    );

    return res.json({

      success:true,

      explanation:
        content.explanation,

      task,

      notification,

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

module.exports = {
  generateAITask,
  evaluateCode,
  generateClassroomAssistant,
  startClassWithAI,
};