
const mongoose = require("mongoose");

const Career = require("../models/Career");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const Prediction = require("../models/Prediction");

const {
    buildUserSkillMap,
    scoreCareer
} = require("../utils/careerMatcher");

// Load user skills from profile and latest resume
const loadUserSkills = async (userId) => {
    const [profile, resume] = await Promise.all([
        Profile.findOne({ userId }).lean(),
        Resume.findOne({ userId })
            .sort({ createdAt: -1 })
            .select("parsedData.skills")
            .lean()
    ]);

    return {
        profile,
        resume,
        map: buildUserSkillMap(profile, resume)
    };
};

// 1. Get all careers
const getCareers = async (req, res) => {
    try {
        const careers = await Career.find()
            .sort({ title: 1 })
            .lean();

        res.json({
            success: true,
            careers
        });
    } catch (e) {
        console.error("Get careers error:", e.message);
        res.status(500).json({
            message: "Unable to fetch careers."
        });
    }
};

// 2. Recommend careers based on user skills
const recommendCareers = async (req, res) => {
    try {
        const { profile, resume, map } =
            await loadUserSkills(req.user.id);

        if (map.size === 0) {
            return res.status(400).json({
                message: "Add skills to your profile or upload a resume first."
            });
        }

        const preferred = (profile?.preferredCareer || [])
            .map((p) => p.toLowerCase());

        const careers = await Career.find().lean();

        const recommendations = careers
            .map((career) => {
                const { alignment, details } =
                    scoreCareer(career, map);

                const boost = preferred.includes(
                    career.title.toLowerCase()
                ) ? 5 : 0;

                return {
                    careerId: career._id,
                    careerName: career.title,
                    category: career.category,
                    demand: career.demand,
                    description: career.description,
                    skillAlignment: alignment,
                    predictionProbability: Math.min(
                        alignment + boost,
                        100
                    ),
                    matchedSkills: details
                        .filter((d) => d.status === "matched")
                        .map((d) => d.name),
                    missingSkills: details
                        .filter((d) => d.status !== "matched")
                        .map((d) => d.name)
                };
            })
            .sort(
                (a, b) =>
                    b.predictionProbability -
                    a.predictionProbability
            )
            .slice(0, 5);

        await Prediction.create({
            userId: req.user.id,
            resumeId: resume?._id,
            recommendations: recommendations.map(
                ({
                    careerId,
                    careerName,
                    predictionProbability,
                    skillAlignment
                }) => ({
                    careerId,
                    careerName,
                    predictionProbability,
                    skillAlignment
                })
            ),
            modelVersion: "rule-v1"
        });

        res.json({
            success: true,
            recommendations
        });

    } catch (e) {
        console.error("Recommend error:", e.message);

        res.status(500).json({
            message: "Unable to generate recommendations."
        });
    }
};

// 3. Get skill gap for a career
const getSkillGap = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        const career = await Career.findById(
            req.params.careerId
        ).lean();

        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        const { map } = await loadUserSkills(req.user.id);

        const { alignment, details } =
            scoreCareer(career, map);

        res.json({
            success: true,
            career: {
                id: career._id,
                title: career.title
            },
            readiness: alignment,
            skills: details
        });

    } catch (e) {
        console.error("Skill gap error:", e.message);

        res.status(500).json({
            message: "Unable to analyze skill gap."
        });
    }
};

// 4. Get individual career details
const getCareerById = async (req, res) => {
    try {
        const { careerId } = req.params;

        if (!mongoose.isValidObjectId(careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        const career = await Career.findById(careerId).lean();

        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        res.json({
            success: true,
            career
        });

    } catch (e) {
        console.error("Get career error:", e.message);

        res.status(500).json({
            message: "Unable to fetch career details."
        });
    }
};

// 5. Get tracks belonging to a particular career
const getCareerTracks = async (req, res) => {
    try {
        const { careerId } = req.params;

        if (!mongoose.isValidObjectId(careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        const career = await Career.findById(careerId)
            .select("title tracks")
            .lean();

        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        res.json({
            success: true,
            career: {
                id: career._id,
                title: career.title
            },
            tracks: career.tracks || []
        });

    } catch (e) {
        console.error("Career tracks error:", e.message);

        res.status(500).json({
            message: "Unable to fetch career tracks."
        });
    }
};

// 6. Get career-specific interview preparation
const getInterviewPreparation = async (req, res) => {
    try {
        const { careerId } = req.params;

        if (!mongoose.isValidObjectId(careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        const career = await Career.findById(careerId)
            .select("title description tracks interviewPreparation")
            .lean();

        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        res.json({
            success: true,

            career: {
                id: career._id,
                title: career.title,
                description: career.description
            },

            interviewPreparation: career.interviewPreparation || {
                overview: "",
                generalQuestions: [],
                tips: []
            },

            tracks: (career.tracks || []).map((track) => ({
                _id: track._id,
                title: track.title,
                description: track.description,
                topics: track.topics || [],
                requiredSkills: track.requiredSkills || [],
                resources: track.resources || []
            }))
        });

    } catch (e) {
        console.error("Interview preparation error:", e.message);

        res.status(500).json({
            message: "Unable to fetch interview preparation."
        });
    }
};

module.exports = {
    getCareers,
    recommendCareers,
    getSkillGap,
    getCareerById,
    getCareerTracks,
    getInterviewPreparation
};
