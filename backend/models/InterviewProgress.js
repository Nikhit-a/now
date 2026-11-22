const mongoose = require("mongoose");

const completedQuestionSchema = new mongoose.Schema(
    {
        questionId: {
            type: String,
            required: true,
            trim: true
        },
        questionText: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            default: "Technical"
        },
        difficulty: {
            type: String,
            default: "Medium"
        },
        trackTitle: {
            type: String,
            default: ""
        },
        topicTitle: {
            type: String,
            default: ""
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const interviewProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        careerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true,
            index: true
        },
        careerTitle: {
            type: String,
            default: ""
        },
        completedQuestions: [completedQuestionSchema],
        lastPracticedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// One progress document per user per career
interviewProgressSchema.index({ userId: 1, careerId: 1 }, { unique: true });

module.exports = mongoose.model("InterviewProgress", interviewProgressSchema);
