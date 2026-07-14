const Student = require(
  "../models/Student"
);

const Attendance = require(
  "../models/Attendance"
);

const Task = require(
  "../models/Task"
);

const Submission = require(
  "../models/Submission"
);

const Evaluation = require(
  "../models/Evaluation"
);

const getSessionAnalytics =
async (req, res) => {

  try {

    const { sessionId } =
      req.params;

    const totalStudents =
      await Student.countDocuments({
        sessionId,
      });

    const attendanceCount =
      await Attendance.countDocuments({
        sessionId,
      });

    const totalTasks =
      await Task.countDocuments({
        sessionId,
      });

    const totalSubmissions =
      await Submission.countDocuments();

    const evaluations =
      await Evaluation.find();

    const averageScore =
      evaluations.length > 0
        ? Math.round(
            evaluations.reduce(
              (sum, item) =>
                sum + item.score,
              0
            ) /
            evaluations.length
          )
        : 0;

    const leaderboard =
      [];

    const students =
      await Student.find({
        sessionId,
      });

    for (
      const student
      of students
    ) {

      const submissions =
        await Submission.find({
          studentId:
            student._id,

          status:
            "evaluated",
        });

      const score =
        submissions.reduce(
          (sum, item) =>
            sum +
            (item.score || 0),
          0
        );

      leaderboard.push({
        name:
          student.name,

        rollNo:
          student.rollNo,

        score,
      });

    }

    leaderboard.sort(
      (a, b) =>
        b.score - a.score
    );

    return res.json({

      success: true,

      analytics: {

        totalStudents,

        attendanceCount,

        totalTasks,

        totalSubmissions,

        averageScore,

        topPerformer:
          leaderboard[0] ||
          null,

      }

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

module.exports = {
  getSessionAnalytics,
};