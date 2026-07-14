const router =
require("express")
.Router();

const {
 getSessionAnalytics
} = require(
 "../controllers/analytics.controller"
);

router.get(
 "/:sessionId",
 getSessionAnalytics
);

module.exports =
router;