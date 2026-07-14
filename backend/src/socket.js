let io;

const sessionTeachers =
  new Map();

const initializeSocket =
(server) => {

  const { Server } =
    require("socket.io");

  io = new Server(server, {

    cors: {

      origin: "*",

      methods: [
        "GET",
        "POST"
      ]

    }

  });

  io.on(
    "connection",
    (socket) => {

      console.log(
        "Socket Connected:",
        socket.id
      );

      /*
      |--------------------------------------------------------------------------
      | Teacher Join
      |--------------------------------------------------------------------------
      */

      socket.on(
        "teacher_join",
        (sessionCode) => {

          socket.join(
            sessionCode
          );

          sessionTeachers.set(
            sessionCode,
            socket.id
          );

          socket.data.role =
            "teacher";

          socket.data.sessionCode =
            sessionCode;

          console.log(
            `Teacher ${socket.id} joined ${sessionCode}`
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Student Join
      |--------------------------------------------------------------------------
      */

      socket.on(
        "student_join",
        (sessionCode) => {

          socket.join(
            sessionCode
          );

          socket.data.role =
            "student";

          socket.data.sessionCode =
            sessionCode;

          console.log(
            `Student ${socket.id} joined ${sessionCode}`
          );

          const teacherSocketId =
            sessionTeachers.get(
              sessionCode
            );

          if (
            teacherSocketId
          ) {

            io.to(
              teacherSocketId
            ).emit(
              "student_connected",
              {
                socketId:
                  socket.id
              }
            );

          }

          io.to(
            sessionCode
          ).emit(
            "student_joined_live",
            {
              socketId:
                socket.id
            }
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Offer
      |--------------------------------------------------------------------------
      */

      socket.on(
        "offer",
        ({
          offer,
          targetSocketId
        }) => {

          io.to(
            targetSocketId
          ).emit(
            "offer",
            {
              offer,
              from:
                socket.id
            }
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Answer
      |--------------------------------------------------------------------------
      */

      socket.on(
        "answer",
        ({
          answer,
          targetSocketId
        }) => {

          io.to(
            targetSocketId
          ).emit(
            "answer",
            {
              answer,
              from:
                socket.id
            }
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | ICE Candidate
      |--------------------------------------------------------------------------
      */

      socket.on(
        "ice-candidate",
        ({
          candidate,
          targetSocketId
        }) => {

          io.to(
            targetSocketId
          ).emit(
            "ice-candidate",
            {
              candidate,
              from:
                socket.id
            }
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Screen Share Started
      |--------------------------------------------------------------------------
      */

      socket.on(
        "start_screen_share",
        (sessionCode) => {

          console.log(
            "Screen Share Started:",
            sessionCode
          );

          io.to(
            sessionCode
          ).emit(
            "screen_share_started",
            {
              teacherSocketId:
                socket.id
            }
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Screen Share Stopped
      |--------------------------------------------------------------------------
      */

      socket.on(
        "stop_screen_share",
        (sessionCode) => {

          console.log(
            "Screen Share Stopped:",
            sessionCode
          );

          io.to(
            sessionCode
          ).emit(
            "screen_share_stopped"
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Activity Feed
      |--------------------------------------------------------------------------
      */

      socket.on(
        "activity_created",
        ({
          sessionCode,
          activity
        }) => {

          io.to(
            sessionCode
          ).emit(
            "activity_created",
            activity
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Notification
      |--------------------------------------------------------------------------
      */

      socket.on(
        "notification_created",
        ({
          sessionCode,
          notification
        }) => {

          io.to(
            sessionCode
          ).emit(
            "notification_received",
            notification
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Leaderboard Update
      |--------------------------------------------------------------------------
      */

      socket.on(
        "leaderboard_updated",
        (sessionCode) => {

          io.to(
            sessionCode
          ).emit(
            "leaderboard_updated"
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Evaluation Complete
      |--------------------------------------------------------------------------
      */

      socket.on(
        "evaluation_completed",
        ({
          sessionCode,
          evaluation
        }) => {

          io.to(
            sessionCode
          ).emit(
            "evaluation_completed",
            evaluation
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Task Created
      |--------------------------------------------------------------------------
      */

      socket.on(
        "task_created",
        ({
          sessionCode,
          task
        }) => {

          io.to(
            sessionCode
          ).emit(
            "task_created",
            task
          );

        }
      );

      /*
      |--------------------------------------------------------------------------
      | Disconnect
      |--------------------------------------------------------------------------
      */

      socket.on(
        "disconnect",
        () => {

          console.log(
            "Socket Disconnected:",
            socket.id
          );

          if (
            socket.data?.role ===
            "teacher"
          ) {

            sessionTeachers.forEach(
              (
                teacherId,
                sessionCode
              ) => {

                if (
                  teacherId ===
                  socket.id
                ) {

                  sessionTeachers.delete(
                    sessionCode
                  );

                }

              }
            );

          }

          if (
            socket.data
              ?.sessionCode
          ) {

            io.to(
              socket.data
                .sessionCode
            ).emit(
              "user_disconnected",
              {
                socketId:
                  socket.id
              }
            );

          }

        }
      );

    }
  );

  return io;

};

const getIO =
() => {

  if (!io) {

    throw new Error(
      "Socket.io not initialized"
    );

  }

  return io;

};

module.exports = {
  initializeSocket,
  getIO
};