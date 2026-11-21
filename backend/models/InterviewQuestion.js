
const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    // Career category, such as Web Development or General
    track: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // Question difficulty
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    // Question category
    type: {
      type: String,
      enum: ["technical", "behavioral"],
      required: true,
    },

    // Interview question
    question: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Keywords used for automated answer evaluation
    // Example: ["React|ReactJS", "components", "hooks"]
    keywords: {
      type: [String],
      default: [],
    },

    // Expected answer for evaluation and result feedback
    modelAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    // Allows questions to be enabled or disabled
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize filtering questions by career track and difficulty
interviewQuestionSchema.index({
  track: 1,
  difficulty: 1,
});

module.exports = mongoose.model(
  "InterviewQuestion",
  interviewQuestionSchema
);
