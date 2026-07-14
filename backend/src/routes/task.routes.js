const router =
require("express")
.Router();


const {
  createTask,
  getTaskSubmissions,
  getSessionTasks
} = require(
  "../controllers/task.controller"
);

router.post(
  "/create",
  createTask
);

router.get(
  "/:taskId/submissions",
  getTaskSubmissions
);

router.get(
 "/session/:sessionId",
 getSessionTasks
);

module.exports =
router;