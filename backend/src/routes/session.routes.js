const router = require("express").Router();

const {
  createSession,
  getSessionStudents,
  getAllSessions,
  getSessionById,
} = require("../controllers/session.controller");

router.post(
  "/create",
  createSession
);

router.get(
  "/",
  getAllSessions
);

router.get(
  "/:id",
  getSessionById
);

router.get(
  "/:sessionId/students",
  getSessionStudents
);

module.exports = router;