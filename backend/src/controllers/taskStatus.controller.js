const Task = require("../models/Task");
const Submission = require("../models/Submission");
const Student = require("../models/Student");

const getTaskStatus = async (req, res) => {
  try {

    const { taskId } = req.params;

    const task =
      await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const totalStudents =
      await Student.countDocuments({
        sessionId: task.sessionId,
      });

    const submitted =
      await Submission.countDocuments({
        taskId,
      });

    const pending =
      totalStudents - submitted;

    const completionRate =
      totalStudents > 0
        ? Math.round(
            (submitted /
              totalStudents) *
              100
          )
        : 0;

    return res.json({
      success: true,

      task: {
        id: task._id,
        title: task.title,
      },

      totalStudents,
      submitted,
      pending,
      completionRate,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getTaskStatus,
};