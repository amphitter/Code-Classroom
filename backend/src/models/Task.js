const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    instructions: {
      type: String,
      required: true,
    },

    starterCode: {
      type: String,
      default: "",
    },

    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    evaluationCriteria: {
  type: String,
  default: ""
},

expectedOutput: {
  type: String,
  default: ""
},

maxScore: {
  type: Number,
  default: 100
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Task",
  taskSchema
);