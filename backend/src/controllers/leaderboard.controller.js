const Submission = require("../models/Submission");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

/*
|--------------------------------------------------------------------------
| SESSION LEADERBOARD
|--------------------------------------------------------------------------
*/

const getLeaderboard = async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(
      "LEADERBOARD SESSION:",
      sessionId
    );

    const attendance =
      await Attendance.find({
        sessionId,
      });

    console.log(
      "ATTENDANCE COUNT:",
      attendance.length
    );

    const studentIds =
      attendance.map(
        (record) => record.studentId
      );

    if (studentIds.length === 0) {
      return res.json({
        success: true,
        leaderboard: [],
      });
    }

    const students =
      await Student.find({
        _id: {
          $in: studentIds,
        },
      });

    console.log(
      "STUDENTS COUNT:",
      students.length
    );

    const leaderboard = [];

    for (const student of students) {
      const submissions =
        await Submission.find({
          studentId: student._id,
          sessionId,
          status: "evaluated",
        });

      const totalScore =
        submissions.reduce(
          (sum, submission) =>
            sum + (submission.score || 0),
          0
        );

      const totalSubmissions =
        submissions.length;

      leaderboard.push({
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        totalScore,
        submissions: totalSubmissions,
      });
    }

    leaderboard.sort(
      (a, b) =>
        b.totalScore - a.totalScore
    );

    return res.json({
      success: true,
      totalStudents:
        leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error(
      "SESSION LEADERBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GLOBAL LEADERBOARD
|--------------------------------------------------------------------------
*/

const getGlobalLeaderboard =
  async (req, res) => {
    try {
      const students =
        await Student.find();

      const leaderboard = [];

      for (const student of students) {
        const submissions =
          await Submission.find({
            studentId: student._id,
            status: "evaluated",
          });

        const totalScore =
          submissions.reduce(
            (sum, submission) =>
              sum + (submission.score || 0),
            0
          );

        const attendanceCount =
          await Attendance.countDocuments({
            studentId: student._id,
          });

        leaderboard.push({
          studentId: student._id,
          name: student.name,
          rollNo: student.rollNo,
          totalScore,
          sessionsJoined:
            attendanceCount,
          submissions:
            submissions.length,
        });
      }

      leaderboard.sort(
        (a, b) =>
          b.totalScore - a.totalScore
      );

      return res.json({
        success: true,
        totalStudents:
          leaderboard.length,
        leaderboard,
      });
    } catch (error) {
      console.error(
        "GLOBAL LEADERBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getLeaderboard,
  getGlobalLeaderboard,
};