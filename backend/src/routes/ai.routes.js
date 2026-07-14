const router =
require("express").Router();

const {
  generateAITask,
  evaluateCode,
  generateClassroomAssistant,
    startClassWithAI,
} = require(
  "../controllers/ai.controller"
);
router.post(
  "/generate-task",
  generateAITask
);

router.post(
  "/evaluate",
  evaluateCode
);
router.post(
  "/start-class",
  startClassWithAI
);
router.post(
  "/classroom-assistant",
  generateClassroomAssistant
);
module.exports = router;