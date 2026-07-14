const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");
const studentRoutes = require("./routes/student.routes");
const notificationRoutes = require("./routes/notification.routes");
const taskRoutes = require("./routes/task.routes");
const aiRoutes = require("./routes/ai.routes");
const submissionRoutes = require("./routes/submission.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const taskStatusRoutes = require("./routes/taskStatus.routes");
const analyticsRoutes =
require(
 "./routes/analytics.routes"
);
const activityRoutes =
require(
 "./routes/activity.routes"
);
const adminRoutes =
require(
 "./routes/admin.routes"
);


const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send(
    "CITN Classroom API Running 🚀"
  );
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use(
  "/api/session",
  sessionRoutes
);
app.use(
 "/api/admin",
 adminRoutes
);
app.use(
  "/api/student",
  studentRoutes
);

app.use(
  "/api/notification",
  notificationRoutes
);

app.use(
  "/api/task",
  taskRoutes
);

app.use(
  "/api/task",
  taskStatusRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/submission",
  submissionRoutes
);

app.use(
  "/api/evaluation",
  evaluationRoutes
);

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);
app.use(
 "/api/analytics",
 analyticsRoutes
);

app.use(
 "/api/activity",
 activityRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;