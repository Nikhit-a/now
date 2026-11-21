
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Code2,
  GraduationCap,
  Lightbulb,
  Loader2,
  MessageCircle,
  Search,
  Target,
  CheckCircle2,
  PlayCircle,
  RefreshCw,
  Clock,
  Award,
} from "lucide-react";
import API from "../services/api";

const categories = [
  "All",
  "Technical",
  "HR",
  "Behavioral",
  "Scenario Based",
];

const difficulties = ["All", "Easy", "Medium", "Hard"];

const getQuestionId = (question, index) =>
  String(
    question._id ||
      `${question.trackTitle || "general"}-${question.topicTitle || "general"}-${question.question || index}`
  );

function InterviewPreparation() {
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [preparation, setPreparation] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [search, setSearch] = useState("");

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPreparation, setLoadingPreparation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCareers();
  }, []);

  useEffect(() => {
    if (selectedCareer) {
      fetchPreparation(selectedCareer);

      try {
        const saved = localStorage.getItem(
          `interview-progress-${selectedCareer}`
        );

        setCompletedQuestions(saved ? JSON.parse(saved) : []);
      } catch {
        setCompletedQuestions([]);
      }
    }
  }, [selectedCareer]);

  const fetchCareers = async () => {
    try {
      setLoadingCareers(true);
      setError("");

      const response = await API.get("/careers");

      const data =
        response.data?.careers ||
        response.data?.data ||
        response.data;

      const careerList = Array.isArray(data) ? data : [];

      setCareers(careerList);

      if (careerList.length > 0) {
        setSelectedCareer(String(careerList[0]._id));
      }
    } catch (err) {
      console.error("Career loading error:", err);

      setError(
        err.response?.data?.message || "Unable to load careers."
      );

      toast.error("Unable to load careers.");
    } finally {
      setLoadingCareers(false);
    }
  };

  const fetchPreparation = async (careerId) => {
    try {
      setLoadingPreparation(true);
      setPreparation(null);
      setExpandedQuestion(null);
      setError("");

      const response = await API.get(
        `/careers/${careerId}/interview-preparation`
      );

      // Backend returns:
      // { success, career, interviewPreparation, tracks }
      setPreparation(response.data);
    } catch (err) {
      console.error("Interview preparation error:", err);

      setPreparation(null);

      const message =
        err.response?.data?.message ||
        "Unable to load interview preparation.";

      setError(message);
      toast.error(message);
    } finally {
      setLoadingPreparation(false);
    }
  };

  const interviewData = preparation?.interviewPreparation || {};

  const generalQuestions = Array.isArray(
    interviewData.generalQuestions
  )
    ? interviewData.generalQuestions
    : [];

  const tracks = Array.isArray(preparation?.tracks)
    ? preparation.tracks
    : [];

  const allQuestions = [
    ...generalQuestions.map((question) => ({
      ...question,
      trackTitle: "",
      topicTitle: "",
    })),

    ...tracks.flatMap((track) =>
      (track.topics || []).flatMap((topic) =>
        (topic.questions || []).map((question) => ({
          ...question,
          topicTitle: topic.title,
          trackTitle: track.title,
        }))
      )
    ),
  ];

  const filteredQuestions = allQuestions.filter((question) => {
    const matchesCategory =
      activeCategory === "All" ||
      question.category?.toLowerCase() ===
        activeCategory.toLowerCase();

    const matchesDifficulty =
      activeDifficulty === "All" ||
      question.difficulty === activeDifficulty;

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      question.question?.toLowerCase().includes(searchText) ||
      question.answer?.toLowerCase().includes(searchText);

    return (
      matchesCategory &&
      matchesDifficulty &&
      matchesSearch
    );
  });

  const selectedCareerData = careers.find(
    (career) => String(career._id) === selectedCareer
  );

  const careerTitle =
    preparation?.career?.title ||
    selectedCareerData?.title ||
    "Interview Preparation";

  const careerDescription =
    preparation?.career?.description ||
    "Build your confidence and prepare for your next interview.";

  const completedCount = allQuestions.filter(
    (question, index) =>
      completedQuestions.includes(getQuestionId(question, index))
  ).length;

  const progressPercentage =
    allQuestions.length > 0
      ? Math.round((completedCount / allQuestions.length) * 100)
      : 0;

  const toggleQuestion = (id) => {
    setExpandedQuestion((previous) =>
      previous === id ? null : id
    );
  };

  const toggleCompleted = (question, index) => {
    const id = getQuestionId(question, index);

    setCompletedQuestions((previous) => {
      const updated = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];

      try {
        localStorage.setItem(
          `interview-progress-${selectedCareer}`,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error("Unable to save progress:", err);
        toast.error("Unable to save progress.");
      }

      return updated;
    });
  };

  if (loadingCareers) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="animate-spin text-blue-500"
          size={35}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <GraduationCap size={22} />
            <span className="text-sm font-semibold">
              CAREER DEVELOPMENT
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Interview Preparation
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Prepare for your dream role with career-specific
            questions, answers and interview guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            selectedCareer && fetchPreparation(selectedCareer)
          }
          disabled={!selectedCareer || loadingPreparation}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loadingPreparation ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Career Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="career-select"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Select your target career
        </label>

        <select
          id="career-select"
          value={selectedCareer}
          onChange={(e) => setSelectedCareer(e.target.value)}
          disabled={!careers.length}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-md"
        >
          {careers.map((career) => (
            <option key={career._id} value={career._id}>
              {career.title}
            </option>
          ))}
        </select>
      </div>

      {/* No Careers */}
      {!careers.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Briefcase
            className="mx-auto mb-3 text-gray-400"
            size={35}
          />

          <h2 className="font-semibold text-gray-800">
            No careers available
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {error || "Add career data to your database to begin preparation."}
          </p>

          <button
            onClick={fetchCareers}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>
        </div>
      ) : loadingPreparation ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin text-blue-600"
              size={35}
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading your preparation material...
            </p>
          </div>
        </div>
      ) : preparation ? (
        <>
          {/* Career Overview */}
          <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-sm text-blue-100">
                  YOUR TARGET ROLE
                </p>

                <h2 className="text-2xl font-bold">
                  {careerTitle}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  {careerDescription}
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15">
                <Target size={35} />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<MessageCircle size={22} />}
              label="Total Questions"
              value={allQuestions.length}
            />

            <StatCard
              icon={<BookOpen size={22} />}
              label="Learning Tracks"
              value={tracks.length}
            />

            <StatCard
              icon={<Award size={22} />}
              label="Completed"
              value={`${completedCount}/${allQuestions.length}`}
            />
          </div>

          {/* Progress */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                Your Preparation Progress
              </h2>

              <span className="text-sm font-semibold text-blue-600">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Complete interview questions to improve your preparation progress.
            </p>
          </section>

          {/* Interview Questions */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Interview Questions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Practice important questions and understand their answers.
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interview questions..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setExpandedQuestion(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Difficulty Filters */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-gray-500">
                DIFFICULTY:
              </span>

              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => {
                    setActiveDifficulty(difficulty);
                    setExpandedQuestion(null);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    activeDifficulty === difficulty
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>

            {/* Question List */}
            <div className="space-y-3">
              {filteredQuestions.length ? (
                filteredQuestions.map((question) => {
                  const originalIndex = allQuestions.indexOf(question);
                  const id = getQuestionId(question, originalIndex);

                  const isCompleted =
                    completedQuestions.includes(id);

                  return (
                    <div
                      key={id}
                      className="overflow-hidden rounded-lg border border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(id)}
                        className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {question.category || "General"}
                            </span>

                            <span
                              className={`rounded-md px-2 py-1 text-xs font-medium ${
                                question.difficulty === "Hard"
                                  ? "bg-red-50 text-red-600"
                                  : question.difficulty === "Medium"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {question.difficulty || "Easy"}
                            </span>

                            {isCompleted && (
                              <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                                <CheckCircle2 size={13} />
                                Completed
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-800">
                            {question.question}
                          </h3>

                          {question.topicTitle && (
                            <p className="mt-1 text-xs text-gray-500">
                              {question.trackTitle} / {question.topicTitle}
                            </p>
                          )}
                        </div>

                        {expandedQuestion === id ? (
                          <ChevronUp
                            size={20}
                            className="shrink-0 text-gray-500"
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="shrink-0 text-gray-500"
                          />
                        )}
                      </button>

                      {expandedQuestion === id && (
                        <div className="border-t border-gray-100 bg-blue-50/50 p-4">
                          <p className="mb-2 text-sm font-semibold text-blue-800">
                            Suggested Answer
                          </p>

                          <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                            {question.answer ||
                              "Answer guidance has not been added yet."}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              toggleCompleted(question, originalIndex)
                            }
                            className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                              isCompleted
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            <CheckCircle2 size={16} />

                            {isCompleted
                              ? "Mark as Incomplete"
                              : "Mark as Completed"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <Search
                    className="mx-auto mb-3 text-gray-300"
                    size={32}
                  />

                  <p className="font-medium text-gray-700">
                    No questions found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try another category, difficulty or search term.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Learning Tracks */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Preparation Learning Tracks
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Follow these topics to strengthen your interview skills.
              </p>
            </div>

            {tracks.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {tracks.map((track, index) => (
                  <div
                    key={track._id || index}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Code2 size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          {track.title}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {track.topics?.length || 0} topics
                        </p>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-6 text-gray-600">
                      {track.description ||
                        "Strengthen your knowledge through this learning track."}
                    </p>

                    {/* Required Skills */}
                    {track.requiredSkills?.length > 0 && (
                      <div className="mb-4 border-t border-gray-100 pt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          REQUIRED SKILLS
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {track.requiredSkills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                            >
                              {skill.name}
                              {skill.requiredLevel
                                ? ` · ${skill.requiredLevel}`
                                : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topics */}
                    {track.topics?.length > 0 && (
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          TOPICS
                        </p>

                        {track.topics.map((topic, topicIndex) => (
                          <div
                            key={topic._id || topicIndex}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle2
                              size={16}
                              className="shrink-0 text-green-500"
                            />
                            {topic.title}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Resources */}
                    {track.resources?.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          LEARNING RESOURCES
                        </p>

                        {track.resources.map((resource, resourceIndex) => {
                          const title =
                            typeof resource === "string"
                              ? resource
                              : resource.title || "Learning Resource";

                          const url =
                            typeof resource === "object"
                              ? resource.url
                              : null;

                          return (
                            <div
                              key={resourceIndex}
                              className="mb-2 flex items-center gap-2 text-sm"
                            >
                              <PlayCircle
                                size={15}
                                className="shrink-0 text-blue-600"
                              />

                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {title}
                                </a>
                              ) : (
                                <span className="text-gray-600">
                                  {title}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                No learning tracks have been added for this career yet.
              </div>
            )}
          </section>

          {/* Preparation Tips */}
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb
                className="text-amber-600"
                size={22}
              />

              <h2 className="font-bold text-gray-900">
                Interview Preparation Tips
              </h2>
            </div>

            {interviewData.tips?.length > 0 ? (
              <ul className="space-y-2">
                {interviewData.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-6 text-gray-700"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-green-600"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-gray-600">
                Practice explaining your projects, revise core
                technical concepts, use the STAR method for
                behavioral questions, and prepare questions to
                ask the interviewer.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <BookOpen
            className="mx-auto mb-3 text-gray-400"
            size={35}
          />

          <h2 className="font-semibold text-gray-800">
            Preparation material unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "Check that interview preparation data exists for this career in your database."}
          </p>

          <button
            onClick={() => fetchPreparation(selectedCareer)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>

        <span className="text-sm text-gray-500">
          {label}
        </span>
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default InterviewPreparation;
