const router =
require("express")
.Router();

const {
 getActivities
} = require(
 "../controllers/activity.controller"
);

router.get(
 "/:sessionId",
 getActivities
);

module.exports =
router;