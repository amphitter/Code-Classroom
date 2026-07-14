const router =
require("express").Router();

const {
 getTaskStatus
} = require(
 "../controllers/taskStatus.controller"
);

router.get(
 "/:taskId/status",
 getTaskStatus
);

module.exports =
router;