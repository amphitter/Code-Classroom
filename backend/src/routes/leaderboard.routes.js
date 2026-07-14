const express = require("express");
const router = express.Router();

const {
  getLeaderboard,
  getGlobalLeaderboard,
} = require(
  "../controllers/leaderboard.controller"
);

/*
|--------------------------------------------------------------------------
| GLOBAL LEADERBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/global",
  getGlobalLeaderboard
);

/*
|--------------------------------------------------------------------------
| SESSION LEADERBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/:sessionId",
  getLeaderboard
);

module.exports = router;