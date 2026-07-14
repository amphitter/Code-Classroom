const Session = require("../models/Session");
const Student = require("../models/Student");
const {
  createSessionCode,
} = require("../services/session.service");

/*
|--------------------------------------------------------------------------
| CREATE SESSION
|--------------------------------------------------------------------------
*/

const createSession = async (
  req,
  res
) => {
  try {
    const { title } =
      req.body;

    const session =
      await Session.create({
        title,
        code:
          createSessionCode(),
      });

    return res.status(201)
      .json({
        success: true,
        session,
      });

  } catch (error) {

    console.error(error);

    return res.status(500)
      .json({
        success: false,
        message:
          error.message,
      });

  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SESSION
|--------------------------------------------------------------------------
*/

const getSessionById =
  async (req, res) => {

    try {

      const session =
        await Session.findById(
          req.params.id
        );

      if (!session) {

        return res.status(404)
          .json({
            success: false,
            message:
              "Session not found",
          });

      }

      return res.json({
        success: true,
        session,
      });

    } catch (error) {

      return res.status(500)
        .json({
          success: false,
          message:
            error.message,
        });

    }

  };

/*
|--------------------------------------------------------------------------
| GET SESSION STUDENTS
|--------------------------------------------------------------------------
*/

const getSessionStudents =
  async (req, res) => {

    try {

      const { sessionId } =
        req.params;

      const students =
        await Student.find({
          sessionId,
        }).sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        count:
          students.length,
        students,
      });

    } catch (error) {

      return res.status(500)
        .json({
          success: false,
          message:
            error.message,
        });

    }

  };

/*
|--------------------------------------------------------------------------
| GET ALL SESSIONS
|--------------------------------------------------------------------------
*/

const getAllSessions =
  async (req, res) => {

    try {

      const sessions =
        await Session.find()
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        sessions,
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          success: false,
          message:
            "Failed to fetch sessions",
        });

    }

  };

module.exports = {
  createSession,
  getSessionStudents,
  getAllSessions,
  getSessionById,
};