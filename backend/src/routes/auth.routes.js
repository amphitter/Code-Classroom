const router = require("express").Router();
const { loginAdmin } = require("../controllers/auth.controller");

const {
  studentLogin,
} = require("../controllers/auth.controller");

router.post("/student/login", studentLogin);

module.exports = router;
