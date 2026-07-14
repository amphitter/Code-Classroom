const router = require("express").Router();

const {
  createStudent,
  joinStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMySessions,
  getAllStudentsWithStats,
} = require("../controllers/student.controller");

const {
  authenticate,
  authenticateStudent,
} = require("../middleware/auth.middleware");

console.log(
  require("../controllers/student.controller")
);

router.post("/create", createStudent);

router.post(
  "/join",
  authenticate,
  authenticateStudent,
  joinStudent
);

router.get(
  "/sessions",
  authenticate,
  authenticateStudent,
  getMySessions
);

router.get("/", getStudents);

router.get(
  "/stats",
  getAllStudentsWithStats
);
router.get("/:id", getStudentById);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);


module.exports = router;