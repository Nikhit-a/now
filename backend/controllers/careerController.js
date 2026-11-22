
const mongoose = require("mongoose");

const Career = require("../models/Career");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const Prediction = require("../models/Prediction");
const InterviewProgress = require("../models/InterviewProgress");

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
                topics: (track.topics || []).map((topic) => ({
                    _id: topic._id,
                    title: topic.title,
                    description: topic.description,
                    questions: topic.questions || []
                })),
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

// 7. Get user's interview preparation progress for a career
const getInterviewProgress = async (req, res) => {
    try {
        const { careerId } = req.params;

        if (!mongoose.isValidObjectId(careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        const career = await Career.findById(careerId).select("title").lean();
        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        const progress = await InterviewProgress.findOne({
            userId: req.user.id,
            careerId: career._id
        }).lean();

        res.json({
            success: true,
            progress: {
                careerId: career._id,
                careerTitle: career.title,
                completedQuestions: progress?.completedQuestions || [],
                lastPracticedAt: progress?.lastPracticedAt || null
            }
        });
    } catch (e) {
        console.error("Get interview progress error:", e.message);
        res.status(500).json({
            message: "Unable to fetch interview progress."
        });
    }
};

// 8. Toggle question completion status
const toggleQuestionProgress = async (req, res) => {
    try {
        const { careerId } = req.params;
        const {
            questionId,
            questionText,
            category,
            difficulty,
            trackTitle,
            topicTitle,
            status
        } = req.body || {};

        if (!mongoose.isValidObjectId(careerId)) {
            return res.status(400).json({
                message: "Invalid career ID."
            });
        }

        if (!questionId || typeof questionId !== "string" || !questionId.trim()) {
            return res.status(400).json({
                message: "Question ID is required."
            });
        }

        const career = await Career.findById(careerId).select("title").lean();
        if (!career) {
            return res.status(404).json({
                message: "Career not found."
            });
        }

        let progress = await InterviewProgress.findOne({
            userId: req.user.id,
            careerId: career._id
        });

        if (!progress) {
            progress = new InterviewProgress({
                userId: req.user.id,
                careerId: career._id,
                careerTitle: career.title,
                completedQuestions: []
            });
        }

        const qId = questionId.trim();
        const existingIndex = progress.completedQuestions.findIndex(
            (q) => String(q.questionId) === qId
        );

        let isCompleted = false;

        if (status === "completed") {
            if (existingIndex === -1) {
                progress.completedQuestions.push({
                    questionId: qId,
                    questionText: questionText ? String(questionText).trim() : "",
                    category: category || "Technical",
                    difficulty: difficulty || "Medium",
                    trackTitle: trackTitle || "",
                    topicTitle: topicTitle || "",
                    completedAt: new Date()
                });
            }
            isCompleted = true;
        } else if (status === "pending") {
            if (existingIndex !== -1) {
                progress.completedQuestions.splice(existingIndex, 1);
            }
            isCompleted = false;
        } else {
            // Toggle
            if (existingIndex !== -1) {
                progress.completedQuestions.splice(existingIndex, 1);
                isCompleted = false;
            } else {
                progress.completedQuestions.push({
                    questionId: qId,
                    questionText: questionText ? String(questionText).trim() : "",
                    category: category || "Technical",
                    difficulty: difficulty || "Medium",
                    trackTitle: trackTitle || "",
                    topicTitle: topicTitle || "",
                    completedAt: new Date()
                });
                isCompleted = true;
            }
        }

        progress.careerTitle = career.title;
        progress.lastPracticedAt = new Date();
        await progress.save();

        res.json({
            success: true,
            isCompleted,
            questionId: qId,
            completedCount: progress.completedQuestions.length,
            completedQuestions: progress.completedQuestions
        });
    } catch (e) {
        console.error("Toggle interview progress error:", e.message);
        res.status(500).json({
            message: "Unable to update question progress."
        });
    }
};

// 9. Get overall interview preparation summary across all careers
const getInterviewProgressSummary = async (req, res) => {
    try {
        const allProgress = await InterviewProgress.find({
            userId: req.user.id
        }).lean();

        let totalCompleted = 0;
        const careerProgress = [];
        const allCompleted = [];

        for (const prog of allProgress) {
            const count = prog.completedQuestions?.length || 0;
            totalCompleted += count;
            careerProgress.push({
                careerId: prog.careerId,
                careerTitle: prog.careerTitle,
                completedCount: count,
                lastPracticedAt: prog.lastPracticedAt
            });

            for (const q of prog.completedQuestions || []) {
                allCompleted.push({
                    ...q,
                    careerId: prog.careerId,
                    careerTitle: prog.careerTitle
                });
            }
        }

        // Sort recent practiced by completedAt descending
        allCompleted.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        const recentPracticed = allCompleted.slice(0, 10);

        res.json({
            success: true,
            summary: {
                totalCompleted,
                careerProgress,
                recentPracticed
            }
        });
    } catch (e) {
        console.error("Progress summary error:", e.message);
        res.status(500).json({
            message: "Unable to fetch interview progress summary."
        });
    }
};

module.exports = {
    getCareers,
    recommendCareers,
    getSkillGap,
    getCareerById,
    getCareerTracks,
    getInterviewPreparation,
    getInterviewProgress,
    toggleQuestionProgress,
    getInterviewProgressSummary
};
