const router =
require("express")
.Router();

const {
 evaluateSubmissionController
} = require(
 "../controllers/evaluation.controller"
);

router.post(
 "/:submissionId",
 evaluateSubmissionController
);

module.exports =
router;