const router =
require("express")
.Router();

const upload =
require(
 "../config/multer"
);

const {
  authenticate,
  authenticateStudent
} = require(
  "../middleware/auth.middleware"
);


const {
 uploadSubmission,
 viewSubmission,
    getMySubmissions,
    getSessionSubmissions
} = require(
 "../controllers/submission.controller"
);

router.post(
 "/upload",
 authenticate,
 authenticateStudent,
 upload.single("file"),
 uploadSubmission
);
router.get(
 "/:id/view",
 viewSubmission
);

router.get(
  "/my-submissions",
  authenticate,
  authenticateStudent,
  getMySubmissions
);

router.get(
 "/session/:sessionId",
 authenticate,
 authenticateStudent,
 getSessionSubmissions
);

module.exports =
router;