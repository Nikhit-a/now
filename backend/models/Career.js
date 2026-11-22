
const mongoose = require("mongoose");

// Interview Question Schema
const interviewQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },

    answer: {
        type: String,
        default: ""
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
    },

    category: {
        type: String,
        enum: ["Technical", "HR", "Behavioral", "Scenario Based"],
        default: "Technical"
    },

    explanation: {
        type: String,
        default: ""
    },

    keyPoints: [{
        type: String
    }],

    example: {
        type: String,
        default: ""
    },

    commonMistakes: [{
        type: String
    }],

    keywords: [{
        type: String
    }]
});

// Interview Topic Schema
const interviewTopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    questions: [interviewQuestionSchema]
});

// Career Track Schema
const trackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    requiredSkills: [{
        name: {
            type: String,
            required: true
        },

        requiredLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        }
    }],

    topics: [interviewTopicSchema],

    resources: [{
        title: {
            type: String,
            required: true
        },

        url: {
            type: String,
            default: ""
        },

        type: {
            type: String,
            enum: ["Video", "Article", "Documentation", "Course", "Other"],
            default: "Other"
        }
    }]
});

// Main Career Schema
const careerSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        default: ""
    },

    requiredSkills: [{
        name: {
            type: String,
            required: true
        },

        requiredLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        }
    }],

    experienceLevel: {
        type: String,
        default: "Entry Level"
    },

    demand: {
        type: String,
        default: "Medium"
    },

    tracks: [trackSchema],

    interviewPreparation: {
        overview: {
            type: String,
            default: ""
        },

        generalQuestions: [interviewQuestionSchema],

        tips: [{
            type: String
        }]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Career", careerSchema);
