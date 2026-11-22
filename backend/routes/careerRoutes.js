const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getCareers,
    recommendCareers,
    getSkillGap,
    getCareerById,
    getCareerTracks,
    getInterviewPreparation,
    getInterviewProgress,
    toggleQuestionProgress,
    getInterviewProgressSummary
} = require("../controllers/careerController");

// Existing APIs
router.get("/", protect, getCareers);
router.get("/recommendations", protect, recommendCareers);

// Progress summary across all careers (must be before :careerId params)
router.get("/interview-progress/summary", protect, getInterviewProgressSummary);

// Career-specific Interview Preparation APIs
router.get("/:careerId/tracks", protect, getCareerTracks);
router.get("/:careerId/interview-preparation", protect, getInterviewPreparation);
router.get("/:careerId/interview-progress", protect, getInterviewProgress);
router.post("/:careerId/interview-progress/toggle", protect, toggleQuestionProgress);

// Existing Skill Gap API
router.get("/:careerId/skill-gap", protect, getSkillGap);

// Get individual career details
router.get("/:careerId", protect, getCareerById);

module.exports = router;
