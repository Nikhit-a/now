
const mongoose = require("mongoose");
const Career = require("../models/Career");
const InterviewQuestion = require("../models/InterviewQuestion");
const InterviewSession = require("../models/InterviewSession");
const { resolveTracks } = require("../data/interviewQuestions");
const { scoreAnswer, summarize } = require("../utils/answerScorer");

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

// Shuffle questions randomly
function shuffle(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// Prefer the requested difficulty, then nearest difficulties
function pick(pool, difficulty, n) {
  return shuffle(pool)
    .sort((a, b) => {
      const diffA = Math.abs(
        DIFF_ORDER[a.difficulty] - DIFF_ORDER[difficulty]
      );

      const diffB = Math.abs(
        DIFF_ORDER[b.difficulty] - DIFF_ORDER[difficulty]
      );

      return diffA - diffB;
    })
    .slice(0, n);
}

// Build and score an answer entry
async function buildEntry(question, text, skipped, timeTaken) {
  const finalText = skipped ? "" : text;

  const scored = await scoreAnswer(question, finalText);

  return {
    questionId: question._id,
    question: question.question,
    type: question.type,
    difficulty: question.difficulty,
    modelAnswer: question.modelAnswer,
    answer: finalText,
    skipped: !finalText,
    score: scored.score,
    matched: scored.matched,
    missed: scored.missed,
    feedback: scored.feedback,
    method: scored.method,
    timeTaken,
  };
}

// POST /api/interviews/start
exports.startInterview = async (req, res) => {
  try {
    const { careerId, difficulty } = req.body || {};
    const count = Number(req.body?.count);

    // Validate input
    if (!mongoose.isValidObjectId(careerId)) {
      return res.status(400).json({
        message: "Invalid career id",
      });
    }

    if (!DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        message: "Difficulty must be Easy, Medium or Hard",
      });
    }

    if (![5, 10].includes(count)) {
      return res.status(400).json({
        message: "Number of questions must be 5 or 10",
      });
    }

    // Find selected career
    const career = await Career.findById(careerId).lean();

    if (!career) {
      return res.status(404).json({
        message: "Career not found",
      });
    }

    // Resolve career-specific question tracks
    const trackNames = resolveTracks(career);

    const specificPool = trackNames.length
      ? await InterviewQuestion.find({
          track: { $in: trackNames },
          active: true,
        }).lean()
      : [];

    // General questions as fallback
    const generalPool = await InterviewQuestion.find({
      track: "General",
      active: true,
    }).lean();

    // Select questions
    let selected = pick(specificPool, difficulty, count);

    if (selected.length < count) {
      selected = selected.concat(
        pick(generalPool, difficulty, count - selected.length)
      );
    }

    if (!selected.length) {
      return res.status(404).json({
        message:
          "Question bank is empty. Run: npm run seed:questions",
      });
    }

    selected = shuffle(selected);

    // Inform user when fallback questions are used
    let notice = null;

    if (!trackNames.length) {
      notice =
        "No career-specific questions for this career yet, so general questions are used.";
    } else if (selected.length < count) {
      notice = `Only ${selected.length} questions are available for this selection.`;
    }

    // Create interview session
    const session = await InterviewSession.create({
      userId: req.user.id,
      careerId: career._id,
      careerTitle: career.title,
      difficulty,
      questionCount: selected.length,
      questionIds: selected.map((question) => question._id),
      status: "in_progress",
    });

    return res.status(201).json({
      success: true,
      notice,

      session: {
        _id: session._id,
        careerTitle: session.careerTitle,
        difficulty: session.difficulty,
        questionCount: session.questionCount,
      },

      // Do not expose model answers before interview completion
      questions: selected.map((question) => ({
        _id: question._id,
        question: question.question,
        type: question.type,
        difficulty: question.difficulty,
        track: question.track,
      })),
    });
  } catch (error) {
    console.error("Start interview error:", error.message);

    return res.status(500).json({
      message: "Failed to start interview",
    });
  }
};

// POST /api/interviews/:id/answer
exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answer, skipped, timeTaken } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid interview id",
      });
    }

    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({
        message: "Invalid question id",
      });
    }

    // Find session belonging to logged-in user
    const session = await InterviewSession.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(409).json({
        message: "Interview already finished",
      });
    }

    // Verify question belongs to this session
    const belongsToSession = session.questionIds.some(
      (question) => String(question) === String(questionId)
    );

    if (!belongsToSession) {
      return res.status(400).json({
        message: "Question does not belong to this interview",
      });
    }

    // Prevent duplicate answers
    const alreadyAnswered = session.answers.some(
      (item) => String(item.questionId) === String(questionId)
    );

    if (alreadyAnswered) {
      return res.status(409).json({
        message: "Question already answered",
      });
    }

    const question = await InterviewQuestion.findById(questionId).lean();

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // Sanitize answer and time
    const text =
      typeof answer === "string"
        ? answer.trim().slice(0, 5000)
        : "";

    const rawTime = Number(timeTaken);

    const seconds = Number.isFinite(rawTime)
      ? Math.min(86400, Math.max(0, Math.round(rawTime)))
      : 0;

    const entry = await buildEntry(
      question,
      text,
      skipped === true,
      seconds
    );

    session.answers.push(entry);

    await session.save();

    return res.json({
      success: true,
      answered: session.answers.length,
      total: session.questionIds.length,
    });
  } catch (error) {
    console.error("Submit answer error:", error.message);

    return res.status(500).json({
      message: "Failed to save answer",
    });
  }
};

// POST /api/interviews/:id/finish
exports.finishInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid interview id",
      });
    }

    const session = await InterviewSession.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    // Return existing result if already completed
    if (session.status === "completed") {
      return res.json({
        success: true,
        session,
      });
    }

    if (session.status !== "in_progress") {
      return res.status(409).json({
        message: "Interview cannot be finished",
      });
    }

    // Identify unanswered questions
    const answeredIds = new Set(
      session.answers.map((answer) => String(answer.questionId))
    );

    const missingIds = session.questionIds.filter(
      (questionId) => !answeredIds.has(String(questionId))
    );

    // Automatically mark unanswered questions as skipped
    if (missingIds.length) {
      const questions = await InterviewQuestion.find({
        _id: { $in: missingIds },
      }).lean();

      for (const questionId of missingIds) {
        const question = questions.find(
          (item) => String(item._id) === String(questionId)
        );

        if (question) {
          session.answers.push(
            await buildEntry(question, "", true, 0)
          );
        }
      }
    }

    // Maintain original question order
    const order = new Map(
      session.questionIds.map((questionId, index) => [
        String(questionId),
        index,
      ])
    );

    const ordered = session.answers
      .map((answer) => answer.toObject())
      .sort(
        (a, b) =>
          order.get(String(a.questionId)) -
          order.get(String(b.questionId))
      );

    session.set("answers", ordered);

    // Calculate final score
    const total = ordered.length
      ? ordered.reduce((sum, answer) => sum + answer.score, 0) /
        ordered.length
      : 0;

    session.totalScore = Math.round(total * 10 * 10) / 10;

    // Generate interview summary
    session.summary = summarize(ordered);

    session.status = "completed";
    session.completedAt = new Date();

    await session.save();

    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Finish interview error:", error.message);

    return res.status(500).json({
      message: "Failed to finish interview",
    });
  }
};

// GET /api/interviews
exports.getHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user.id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(50)
      .select(
        "careerTitle difficulty totalScore questionCount completedAt createdAt"
      )
      .lean();

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Interview history error:", error.message);

    return res.status(500).json({
      message: "Failed to load interview history",
    });
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid interview id",
      });
    }

    const session = await InterviewSession.findOne({
      _id: id,
      userId: req.user.id,
    }).lean();

    if (!session) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (session.status !== "completed") {
      return res.status(409).json({
        message: "Interview is not finished yet",
      });
    }

    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get interview error:", error.message);

    return res.status(500).json({
      message: "Failed to load interview",
    });
  }
};
