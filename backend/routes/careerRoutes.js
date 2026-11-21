
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getCareers,
    recommendCareers,
    getSkillGap,
    getCareerById,
    getCareerTracks,
    getInterviewPreparation
} = require("../controllers/careerController");

// Existing APIs
router.get("/", protect, getCareers);
router.get("/recommendations", protect, recommendCareers);

// New Interview Preparation APIs
router.get("/:careerId/tracks", protect, getCareerTracks);
router.get("/:careerId/interview-preparation", protect, getInterviewPreparation);

// Existing Skill Gap API
router.get("/:careerId/skill-gap", protect, getSkillGap);

// Get individual career details
router.get("/:careerId", protect, getCareerById);

module.exports = router;
