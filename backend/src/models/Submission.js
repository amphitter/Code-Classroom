const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "evaluated"
      ],
      default: "pending",
    },
    sessionId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Session",
  required: true,
}
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Submission",
    submissionSchema
  );