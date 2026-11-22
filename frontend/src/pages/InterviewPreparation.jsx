import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Code2,
  Compass,
  ExternalLink,
  Filter,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageCircle,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import API from "../services/api";

const CATEGORIES = [
  "All",
  "Technical",
  "HR",
  "Behavioral",
  "Scenario Based",
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const STATUS_OPTIONS = ["All", "Pending", "Completed"];

// Helper to reliably create a unique, stable question ID
const getQuestionKey = (question, index) => {
  if (question._id) return String(question._id);
  const track = question.trackTitle || "general";
  const topic = question.topicTitle || "general";
  const cleanQ = (question.question || `q-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 50);
  return `${track}__${topic}__${cleanQ}`;
};

function InterviewPreparation() {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState("questions"); // "questions" | "tracks" | "tips" | "analytics"

  // Career state
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [preparation, setPreparation] = useState(null);

  // Filters state
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [activeTrack, setActiveTrack] = useState("All");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Interaction state
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [completedMap, setCompletedMap] = useState({}); // { [questionKey]: { completedAt, ... } }
  const [togglingId, setTogglingId] = useState(null);

  // Loading & error states
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPreparation, setLoadingPreparation] = useState(false);
  const [error, setError] = useState("");

  // 1. Load available careers on mount
  useEffect(() => {
    fetchCareers();
  }, []);

  // 2. Fetch career preparation & user progress whenever selected career changes
  useEffect(() => {
    if (selectedCareer) {
      loadCareerData(selectedCareer);
    }
  }, [selectedCareer]);

  const fetchCareers = async () => {
    try {
      setLoadingCareers(true);
      setError("");

      const response = await API.get("/careers");
      const list = response.data?.careers || response.data || [];
      const careerList = Array.isArray(list) ? list : [];

      setCareers(careerList);

      if (careerList.length > 0) {
        setSelectedCareer(String(careerList[0]._id));
      }
    } catch (err) {
      console.error("Career loading error:", err);
      const msg = err.response?.data?.message || "Unable to load careers.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingCareers(false);
    }
  };

  const loadCareerData = async (careerId) => {
    try {
      setLoadingPreparation(true);
      setError("");
      setExpandedQuestion(null);

      // Load interview preparation content and persistent user progress in parallel
      const [prepRes, progRes] = await Promise.allSettled([
        API.get(`/careers/${careerId}/interview-preparation`),
        API.get(`/careers/${careerId}/interview-progress`),
      ]);

      if (prepRes.status === "fulfilled") {
        setPreparation(prepRes.value.data);
      } else {
        throw prepRes.reason;
      }

      // Populate completed questions map from backend persistence
      if (progRes.status === "fulfilled" && progRes.value.data?.progress) {
        const completedList =
          progRes.value.data.progress.completedQuestions || [];
        const map = {};
        completedList.forEach((item) => {
          map[item.questionId] = item;
        });
        setCompletedMap(map);

        // Backup to localStorage
        try {
          localStorage.setItem(
            `ci_interview_completed_${careerId}`,
            JSON.stringify(map)
          );
        } catch {
          // ignore storage error
        }
      } else {
        // Fallback to local storage if progress call fails
        try {
          const cached = localStorage.getItem(
            `ci_interview_completed_${careerId}`
          );
          if (cached) setCompletedMap(JSON.parse(cached));
          else setCompletedMap({});
        } catch {
          setCompletedMap({});
        }
      }

      // Reset filters when a new career is selected
      setActiveCategory("All");
      setActiveDifficulty("All");
      setActiveTrack("All");
      setActiveTopic("All");
      setActiveStatus("All");
      setSearch("");
    } catch (err) {
      console.error("Interview preparation load error:", err);
      setPreparation(null);
      const message =
        err.response?.data?.message ||
        "Unable to load interview preparation material.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingPreparation(false);
    }
  };

  // Flatten and normalize all questions with track and topic context
  const { allQuestions, tracks, generalQuestions, availableTopics } =
    useMemo(() => {
      const interviewData = preparation?.interviewPreparation || {};
      const gQuestions = Array.isArray(interviewData.generalQuestions)
        ? interviewData.generalQuestions
        : [];
      const trkList = Array.isArray(preparation?.tracks)
        ? preparation.tracks
        : [];

      // Combine general and track-specific questions
      const combined = [
        ...gQuestions.map((q, idx) => ({
          ...q,
          _id: q._id || `gen-${idx}`,
          trackTitle: "General & Placement",
          topicTitle: "Core Placement",
        })),

        ...trkList.flatMap((track) =>
          (track.topics || []).flatMap((topic) =>
            (topic.questions || []).map((q, idx) => ({
              ...q,
              _id: q._id || `${track.title}-${topic.title}-${idx}`,
              trackTitle: track.title,
              topicTitle: topic.title,
            }))
          )
        ),
      ];

      // Available topics based on currently selected track filter
      const topics = trkList.flatMap((track) =>
        (track.topics || [])
          .filter(
            (topic) =>
              activeTrack === "All" || track.title === activeTrack
          )
          .map((topic) => ({
            value: JSON.stringify([track.title, topic.title]),
            trackTitle: track.title,
            topicTitle: topic.title,
          }))
      );

      return {
        allQuestions: combined,
        tracks: trkList,
        generalQuestions: gQuestions,
        availableTopics: topics,
      };
    }, [preparation, activeTrack]);

  // Compute question completion stats
  const stats = useMemo(() => {
    const total = allQuestions.length;
    let completed = 0;

    const trackCounts = {};
    const categoryCounts = {
      Technical: { total: 0, completed: 0 },
      HR: { total: 0, completed: 0 },
      Behavioral: { total: 0, completed: 0 },
      "Scenario Based": { total: 0, completed: 0 },
    };

    allQuestions.forEach((q, idx) => {
      const key = getQuestionKey(q, idx);
      const isDone = Boolean(completedMap[key]);
      if (isDone) completed++;

      // Track distribution
      const trk = q.trackTitle || "General";
      if (!trackCounts[trk]) {
        trackCounts[trk] = { total: 0, completed: 0 };
      }
      trackCounts[trk].total++;
      if (isDone) trackCounts[trk].completed++;

      // Category distribution
      const cat = q.category || "Technical";
      if (categoryCounts[cat]) {
        categoryCounts[cat].total++;
        if (isDone) categoryCounts[cat].completed++;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const remaining = Math.max(0, total - completed);

    return {
      total,
      completed,
      remaining,
      percentage,
      trackCounts,
      categoryCounts,
    };
  }, [allQuestions, completedMap]);

  // Filter questions based on all active criteria
  const filteredQuestions = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allQuestions.filter((q, idx) => {
      const key = getQuestionKey(q, idx);
      const isCompleted = Boolean(completedMap[key]);

      // Category filter
      if (
        activeCategory !== "All" &&
        q.category?.toLowerCase() !== activeCategory.toLowerCase()
      ) {
        return false;
      }

      // Difficulty filter
      if (
        activeDifficulty !== "All" &&
        q.difficulty?.toLowerCase() !== activeDifficulty.toLowerCase()
      ) {
        return false;
      }

      // Track filter
      if (activeTrack !== "All" && q.trackTitle !== activeTrack) {
        return false;
      }

      // Topic filter
      if (activeTopic !== "All") {
        try {
          const [tTrack, tTopic] = JSON.parse(activeTopic);
          if (q.trackTitle !== tTrack || q.topicTitle !== tTopic) {
            return false;
          }
        } catch {
          // ignore parse error
        }
      }

      // Completion status filter
      if (activeStatus === "Completed" && !isCompleted) return false;
      if (activeStatus === "Pending" && isCompleted) return false;

      // Text search match
      if (query) {
        const inQuestion = q.question?.toLowerCase().includes(query);
        const inAnswer = q.answer?.toLowerCase().includes(query);
        const inExpl = q.explanation?.toLowerCase().includes(query);
        const inTopic = q.topicTitle?.toLowerCase().includes(query);
        const inKeywords = Array.isArray(q.keywords)
          ? q.keywords.some((k) => k.toLowerCase().includes(query))
          : false;

        if (!inQuestion && !inAnswer && !inExpl && !inTopic && !inKeywords) {
          return false;
        }
      }

      return true;
    });
  }, [
    allQuestions,
    completedMap,
    activeCategory,
    activeDifficulty,
    activeTrack,
    activeTopic,
    activeStatus,
    search,
  ]);

  // Toggle question completed / pending status with backend persistence
  const handleToggleComplete = async (question, index) => {
    const key = getQuestionKey(question, index);
    const currentlyCompleted = Boolean(completedMap[key]);
    const nextStatus = currentlyCompleted ? "pending" : "completed";

    // Optimistic UI update
    setCompletedMap((prev) => {
      const updated = { ...prev };
      if (nextStatus === "completed") {
        updated[key] = {
          questionId: key,
          questionText: question.question,
          category: question.category,
          difficulty: question.difficulty,
          trackTitle: question.trackTitle,
          topicTitle: question.topicTitle,
          completedAt: new Date().toISOString(),
        };
      } else {
        delete updated[key];
      }

      try {
        localStorage.setItem(
          `ci_interview_completed_${selectedCareer}`,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }

      return updated;
    });

    try {
      setTogglingId(key);
      await API.post(
        `/careers/${selectedCareer}/interview-progress/toggle`,
        {
          questionId: key,
          questionText: question.question,
          category: question.category,
          difficulty: question.difficulty,
          trackTitle: question.trackTitle,
          topicTitle: question.topicTitle,
          status: nextStatus,
        }
      );

      toast.success(
        nextStatus === "completed"
          ? "Question marked as completed!"
          : "Question marked as pending."
      );
    } catch (err) {
      console.error("Toggle progress API error:", err);
      toast.error("Could not sync with cloud. Saved locally.");
    } finally {
      setTogglingId(null);
    }
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setActiveDifficulty("All");
    setActiveTrack("All");
    setActiveTopic("All");
    setActiveStatus("All");
    setSearch("");
    setExpandedQuestion(null);
  };

  const selectedCareerData = careers.find(
    (c) => String(c._id) === selectedCareer
  );
  const careerTitle =
    preparation?.career?.title ||
    selectedCareerData?.title ||
    "Interview Preparation";
  const careerDescription =
    preparation?.career?.description ||
    selectedCareerData?.description ||
    "Master role-specific questions, system architecture, and placement guidance.";

  if (loadingCareers) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm">Loading available career paths...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-100 space-y-6 max-w-7xl mx-auto">
      {/* ================= HEADER & CAREER SELECTOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <GraduationCap className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Placement & Interview Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Interview Preparation
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
              Pro Placement Suite
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Prepare for technical rounds, HR evaluations, and scenario challenges tailored to your target career.
          </p>
        </div>

        {/* Career dropdown & Refresh button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              id="career-selector"
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              disabled={loadingPreparation}
              className="appearance-none rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-100 shadow-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              {careers.map((career) => (
                <option
                  key={career._id}
                  value={career._id}
                  className="bg-slate-900 text-white"
                >
                  {career.title} {career.category ? `(${career.category})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => selectedCareer && loadCareerData(selectedCareer)}
            disabled={loadingPreparation}
            title="Refresh preparation material"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingPreparation ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= CAREER HERO BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/90 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Career Path
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {tracks.length} Learning Tracks
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {careerTitle}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {careerDescription}
            </p>
          </div>

          {/* Quick Circular Progress Ring */}
          <div className="flex items-center gap-4 bg-slate-900/70 border border-white/10 rounded-2xl p-4 shadow-inner">
            <div className="relative flex items-center justify-center h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${stats.percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">
                {stats.percentage}%
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Readiness</div>
              <div className="text-base font-bold text-white">
                {stats.completed} / {stats.total}
              </div>
              <div className="text-xs text-slate-400">Questions Solved</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB NAVIGATION ================= */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "questions", label: "Question Bank", icon: MessageCircle, count: filteredQuestions.length },
          { id: "tracks", label: "Learning Tracks", icon: BookOpen, count: tracks.length },
          { id: "tips", label: "Preparation Masterclass", icon: Lightbulb },
          { id: "analytics", label: "Dashboard & Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-indigo-400 text-indigo-300 bg-white/[0.04]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENT ================= */}

      {/* ----------------- TAB 1: QUESTION BANK ----------------- */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<MessageCircle className="h-5 w-5 text-indigo-400" />}
              label="Total Questions"
              value={stats.total}
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              label="Completed"
              value={stats.completed}
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-amber-400" />}
              label="Remaining"
              value={stats.remaining}
            />
            <StatCard
              icon={<Award className="h-5 w-5 text-cyan-400" />}
              label="Coverage Rate"
              value={`${stats.percentage}%`}
            />
          </div>

          {/* Search & Filter Controls Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4 shadow-sm">
            {/* Top row: Search input & Reset */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions, concepts, keywords, or topics..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {(activeCategory !== "All" ||
                activeDifficulty !== "All" ||
                activeTrack !== "All" ||
                activeTopic !== "All" ||
                activeStatus !== "All" ||
                search) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition self-end sm:self-center"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Secondary Filters: Track, Topic, Difficulty, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Track filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Learning Track
                </label>
                <select
                  value={activeTrack}
                  onChange={(e) => {
                    setActiveTrack(e.target.value);
                    setActiveTopic("All");
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400"
                >
                  <option value="All">All Tracks</option>
                  {tracks.map((t, i) => (
                    <option key={t._id || i} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Specific Topic
                </label>
                <select
                  value={activeTopic}
                  onChange={(e) => setActiveTopic(e.target.value)}
                  disabled={availableTopics.length === 0}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400 disabled:opacity-50"
                >
                  <option value="All">All Topics</option>
                  {availableTopics.map((top) => (
                    <option key={top.value} value={top.value}>
                      {top.topicTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={activeDifficulty}
                  onChange={(e) => setActiveDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Difficulties" : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={activeStatus}
                  onChange={(e) => setActiveStatus(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span>
              Showing{" "}
              <strong className="text-white">
                {filteredQuestions.length}
              </strong>{" "}
              of {allQuestions.length} questions
            </span>
            <span>
              Completed:{" "}
              <strong className="text-emerald-400">{stats.completed}</strong>
            </span>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, index) => {
                const key = getQuestionKey(q, index);
                const isExpanded = expandedQuestion === key;
                const isCompleted = Boolean(completedMap[key]);
                const isToggling = togglingId === key;

                return (
                  <div
                    key={key}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isCompleted
                        ? "border-emerald-500/20 bg-emerald-950/10"
                        : "border-white/10 bg-slate-900/60 hover:border-white/20"
                    }`}
                  >
                    {/* Question Header Card */}
                    <div
                      onClick={() =>
                        setExpandedQuestion(isExpanded ? null : key)
                      }
                      className="cursor-pointer p-5 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-2.5 flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              q.category === "Technical"
                                ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                : q.category === "Behavioral"
                                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                : q.category === "Scenario Based"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {q.category || "Technical"}
                          </span>

                          {/* Difficulty Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              q.difficulty === "Hard"
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                : q.difficulty === "Medium"
                                ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                                : "bg-green-500/15 text-green-300 border border-green-500/30"
                            }`}
                          >
                            {q.difficulty || "Easy"}
                          </span>

                          {/* Track / Topic tag */}
                          {q.topicTitle && (
                            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                              {q.trackTitle} &rsaquo; {q.topicTitle}
                            </span>
                          )}

                          {/* Completed Status Tag */}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 ml-auto sm:ml-0">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Question Title */}
                        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                          {q.question}
                        </h3>

                        {/* Keyword preview pills */}
                        {Array.isArray(q.keywords) && q.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.keywords.slice(0, 4).map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-slate-400 border border-white/5 font-mono"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expand Arrow Button */}
                      <button
                        type="button"
                        aria-label="Toggle answer details"
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition shrink-0 mt-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* ================= EXPANDED LEARNING SUPPORT ================= */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-slate-950/60 p-5 sm:p-7 space-y-6 rounded-b-2xl">
                        {/* 1. Suggested Answer */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="h-4 w-4" />
                            <span>Recommended Interview Answer</span>
                          </div>
                          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-line font-normal">
                            {q.answer || "Answer guidance will be updated soon."}
                          </div>
                        </div>

                        {/* 2. Key Concepts Explained */}
                        {q.explanation && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                              <Compass className="h-4 w-4" />
                              <span>Core Concept Breakdown</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-300">
                              {q.explanation}
                            </p>
                          </div>
                        )}

                        {/* 3. Key Points to Mention */}
                        {Array.isArray(q.keyPoints) && q.keyPoints.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                              <CheckCircle className="h-4 w-4" />
                              <span>Must-Mention Interview Points</span>
                            </div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                              {q.keyPoints.map((point, pIdx) => (
                                <li
                                  key={pIdx}
                                  className="flex items-start gap-2 bg-slate-900/60 border border-white/5 p-2.5 rounded-lg"
                                >
                                  <span className="text-emerald-400 mt-0.5 font-bold">
                                    &bull;
                                  </span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 4. Practical Example or Code */}
                        {q.example && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                              <Code2 className="h-4 w-4" />
                              <span>Practical Implementation / Example</span>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-xs text-amber-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                              {q.example}
                            </div>
                          </div>
                        )}

                        {/* 5. Common Mistakes to Avoid */}
                        {Array.isArray(q.commonMistakes) &&
                          q.commonMistakes.length > 0 && (
                            <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 space-y-2">
                              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Common Interview Pitfalls to Avoid</span>
                              </div>
                              <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc list-inside">
                                {q.commonMistakes.map((mistake, mIdx) => (
                                  <li key={mIdx}>{mistake}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {/* Action Bar: Toggle Complete & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleComplete(q, index)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md ${
                              isCompleted
                                ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-600/40"
                                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/25"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            <span>
                              {isCompleted
                                ? "Completed (Click to Mark Pending)"
                                : "Mark as Completed"}
                            </span>
                          </button>

                          <span className="text-xs text-slate-500 font-mono">
                            ID: {key}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3">
                <Search className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="text-lg font-bold text-white">
                  No matching interview questions
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Try adjusting your search terms, changing the category, track, or difficulty filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: LEARNING TRACKS ----------------- */}
      {activeTab === "tracks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Career Learning Tracks
              </h2>
              <p className="text-sm text-slate-400">
                Systematic topic progression to achieve full interview readiness.
              </p>
            </div>
          </div>

          {tracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((track, tIdx) => {
                const trackStat = stats.trackCounts[track.title] || {
                  total: 0,
                  completed: 0,
                };
                const trackPct =
                  trackStat.total > 0
                    ? Math.round(
                        (trackStat.completed / trackStat.total) * 100
                      )
                    : 0;

                return (
                  <div
                    key={track._id || tIdx}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Track Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Code2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {track.title}
                            </h3>
                            <span className="text-xs text-slate-400">
                              {track.topics?.length || 0} Topics &bull;{" "}
                              {trackStat.total} Questions
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
                          {trackPct}% Done
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {track.description ||
                          "Core competencies required for placement technical rounds."}
                      </p>

                      {/* Track Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progress</span>
                          <span>
                            {trackStat.completed} / {trackStat.total} solved
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${trackPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Topics List */}
                      {track.topics?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Curated Topics
                          </h4>
                          <div className="space-y-1.5">
                            {track.topics.map((top, topIdx) => (
                              <div
                                key={top._id || topIdx}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] text-xs"
                              >
                                <span className="font-medium text-slate-200">
                                  {top.title}
                                </span>
                                <span className="text-slate-400 font-mono">
                                  {top.questions?.length || 0} Qs
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Required Skills */}
                      {Array.isArray(track.requiredSkills) &&
                        track.requiredSkills.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Target Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {track.requiredSkills.map((sk, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                >
                                  {sk.name} ({sk.requiredLevel || "Proficient"})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Resources */}
                    {Array.isArray(track.resources) &&
                      track.resources.length > 0 && (
                        <div className="pt-3 border-t border-white/5 space-y-1.5">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Recommended Resources
                          </h4>
                          {track.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 hover:underline p-1"
                            >
                              <span className="flex items-center gap-1.5">
                                <PlayCircle className="h-3.5 w-3.5" />
                                {res.title}
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
              No learning tracks defined for this career path yet.
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: PREPARATION MASTERCLASS & TIPS ----------------- */}
      {activeTab === "tips" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              Interview Strategy & Masterclass Guide
            </h2>
            <p className="text-sm text-slate-400">
              Battle-tested frameworks for self-introduction, technical rounds, behavioral interviews, and project walkthroughs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: Self Introduction */}
            <GuidanceCard
              icon={<UserRound className="h-5 w-5 text-indigo-400" />}
              title="1. How to Introduce Yourself (Elevator Pitch)"
              subtitle="Use the Present-Past-Future Model (90-120 seconds)"
              content={[
                "Present: Start with your current educational background or engineering role and primary technical domain.",
                "Past: Highlight 1 or 2 significant projects or internships, focusing on your exact technical contributions and quantifiable results.",
                "Future: Connect why your technical trajectory directly aligns with this company's product challenges and culture.",
                "Rule: Avoid reciting your resume line-by-line. Focus on story, impact, and enthusiasm."
              ]}
              example="'I am a software engineer focused on building resilient full-stack systems. Recently, I developed a high-concurrency analytics dashboard that lowered query latency by 40% through Redis caching. I am eager to bring this backend rigor to your distributed fintech services.'"
            />

            {/* Guide 2: Technical Answering Framework */}
            <GuidanceCard
              icon={<Code2 className="h-5 w-5 text-cyan-400" />}
              title="2. How to Answer Technical & System Questions"
              subtitle="The 4-Step Engineering Delivery Framework"
              content={[
                "Step 1: Clarify & Constrain: Confirm assumptions, scale, edge cases, input formats, and failure tolerances before jumping into code.",
                "Step 2: State High-Level Approach: Walk the interviewer through the brute-force or high-level architecture first.",
                "Step 3: Analyze Trade-offs: State Big-O time and space complexity, or database read-heavy vs write-heavy trade-offs.",
                "Step 4: Write Clean, Modular Code: Communicate your thinking out loud as you type or draw."
              ]}
              example="Never stay silent for more than 15 seconds. Say: 'I am evaluating two approaches: a hash map giving O(1) lookup vs a two-pointer approach saving memory. Given our constraints...'"
            />

            {/* Guide 3: STAR Method for HR & Behavioral */}
            <GuidanceCard
              icon={<Compass className="h-5 w-5 text-purple-400" />}
              title="3. Answering Behavioral & HR Questions"
              subtitle="The STAR Method (Situation, Task, Action, Result)"
              content={[
                "Situation: Briefly set the context (team size, project, and challenge).",
                "Task: Explain what your specific responsibility was (not just the team's).",
                "Action: Detail the technical decisions, communication, and leadership steps YOU took.",
                "Result: State the outcome with measurable metrics (e.g. 99.9% uptime, saved 15 engineering hours/week)."
              ]}
              example="'When our primary database connection pool exhausted during a flash sale (S), I was tasked with restoring service (T). I implemented query batching and rate limiting (A), restoring service in 8 minutes and preventing $50k in abandoned carts (R).'"
            />

            {/* Guide 4: Explaining Projects */}
            <GuidanceCard
              icon={<Briefcase className="h-5 w-5 text-amber-400" />}
              title="4. How to Explain Projects Confidently"
              subtitle="Context -> Architecture -> Challenges -> Learnings"
              content={[
                "Lead with the Problem: What user or business problem did this software solve?",
                "System Architecture: Explain the frontend, backend, database choices, and why you chose that stack over alternatives.",
                "The Hardest Challenge: Interviewers always ask 'What was the toughest bug or roadblock?' Prepare one specific technical hurdle.",
                "Learnings & Next Steps: What would you improve or refactor if you had another month?"
              ]}
              example="Structure: 'I built CloudFlow to automate multi-service workflows. The core challenge was handling idempotent webhook retries, which I solved using Redis distributed locks.'"
            />

            {/* Guide 5: Scenario & Crisis Handling */}
            <GuidanceCard
              icon={<AlertTriangle className="h-5 w-5 text-rose-400" />}
              title="5. Answering Production Outage Scenarios"
              subtitle="Containment First, Investigation Second"
              content={[
                "Priority 1: Mitigation over Investigation: Rollback the latest deployment or flip feature flags to restore user traffic immediately.",
                "Priority 2: Clear Stakeholder Communication: Declare incident levels and update internal channels transparently.",
                "Priority 3: Reproduce in Staging: Inspect distributed traces, APM metrics, and error logs in isolation.",
                "Priority 4: Blameless Post-Mortem: Identify systemic root causes and implement regression tests."
              ]}
            />

            {/* Guide 6: Pre-Interview Checklist */}
            <GuidanceCard
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              title="6. 24-Hour Pre-Interview Checklist"
              subtitle="Day Before Placement Drive or Technical Round"
              content={[
                "Re-read every single line on your resume; anything listed is fair game for deep-dive questions.",
                "Prepare 3 insightful questions for the interviewer about their engineering roadmap, deployment frequency, or team culture.",
                "Test camera, microphone, internet stability, and have a quiet background environment ready.",
                "Review core algorithms, SQL joins, and your project's architecture diagram."
              ]}
            />
          </div>

          {/* Career-specific Tips from DB */}
          {preparation?.interviewPreparation?.tips?.length > 0 && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <Lightbulb className="h-5 w-5" />
                <span>Specialized Tips for {careerTitle}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                {preparation.interviewPreparation.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 4: DASHBOARD & ANALYTICS ----------------- */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Preparation Progress & Analytics
            </h2>
            <p className="text-sm text-slate-400">
              Track your preparation coverage, category breakdown, and question mastery over time.
            </p>
          </div>

          {/* Overall Progress Banner */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Readiness Score
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {stats.percentage}% Completed
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats.completed} solved out of {stats.total} total interview questions
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30"
                >
                  <span>Practice Questions</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* High fidelity progress bar */}
            <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.categoryCounts).map(([cat, count]) => {
              const pct =
                count.total > 0
                  ? Math.round((count.completed / count.total) * 100)
                  : 0;

              return (
                <div
                  key={cat}
                  className="rounded-xl border border-white/10 bg-slate-900/60 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {cat}
                    </span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Completed</span>
                    <span>
                      {count.completed} / {count.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Track-wise Breakdown Table / Cards */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Track-Wise Preparation Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.trackCounts).map(([trackName, count]) => {
                const trkPct =
                  count.total > 0
                    ? Math.round((count.completed / count.total) * 100)
                    : 0;

                return (
                  <div
                    key={trackName}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">
                        {trackName}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {count.completed} / {count.total} ({trkPct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${trkPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- SUB-COMPONENTS -----------------

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-1.5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-white/5">{icon}</div>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold font-mono text-white pl-1">
        {value}
      </p>
    </div>
  );
}

function GuidanceCard({ icon, title, subtitle, content, example }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc list-inside">
          {content.map((item, idx) => (
            <li key={idx} className="marker:text-indigo-400">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {example && (
        <div className="mt-2 rounded-xl border border-white/5 bg-slate-950/70 p-3 text-xs text-indigo-200/90 italic leading-relaxed">
          <strong className="not-italic text-indigo-300 block mb-1">
            Example Pitch:
          </strong>
          {example}
        </div>
      )}
    </div>
  );
}

function UserRound(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export default InterviewPreparation;
