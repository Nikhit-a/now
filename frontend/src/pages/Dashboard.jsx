
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    BrainCircuit,
    FileText,
    ChartNoAxesColumnIncreasing,
    Route,
    Scale,
    ChartLine,
    Search,
    ArrowUpRight,
    ArrowRight,
    GraduationCap,
    Code2,
    BriefcaseBusiness,
    Sparkles,
    UserRound,
    Menu,
    Target,
    CheckCircle2,
    Clock3,
    ClipboardCheck,
    MessageSquare,
    Award,
    CalendarClock
} from "lucide-react";

import API from "../services/api";
import NotificationPanel from "../components/NotificationPanel";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [latestResume, setLatestResume] = useState(null);
    const [completedResumeCount, setCompletedResumeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    userResult,
                    profileResult,
                    resumeResult
                ] = await Promise.allSettled([
                    API.get("/auth/me"),
                    API.get("/profile"),
                    API.get("/resume")
                ]);

                if (!isMounted) return;

                // Authentication check
                if (userResult.status === "rejected") {
                    const status = userResult.reason.response?.status;

                    if (status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login", { replace: true });
                        return;
                    }

                    throw userResult.reason;
                }

                // User information
                setUser(userResult.value.data.user);

                // Profile information
                if (profileResult.status === "fulfilled") {
                    setProfile(
                        profileResult.value.data.profile || {
                            education: [],
                            skills: [],
                            interests: [],
                            preferredCareer: []
                        }
                    );
                } else {
                    const status = profileResult.reason.response?.status;

                    if (status === 404) {
                        setProfile({
                            education: [],
                            skills: [],
                            interests: [],
                            preferredCareer: []
                        });
                    } else if (status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login", { replace: true });
                        return;
                    } else {
                        throw profileResult.reason;
                    }
                }

                // Resume analysis information
                if (resumeResult.status === "fulfilled") {
                    const resumes = resumeResult.value.data.resumes || [];

                    // Only consider successfully completed analyses.
                    // The backend returns resumes sorted by newest first.
                    const completedResumes = resumes.filter(
                        (resume) => resume.analysisStatus === "completed"
                    );

                    setCompletedResumeCount(completedResumes.length);

                    // Get the latest completed resume analysis.
                    setLatestResume(completedResumes[0] || null);

                } else {
                    const status = resumeResult.reason.response?.status;

                    if (status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login", { replace: true });
                        return;
                    }

                    // Resume data is optional.
                    // A resume API failure should not block the dashboard.
                    console.error(
                        "Unable to fetch resume information:",
                        resumeResult.reason
                    );

                    setLatestResume(null);
                    setCompletedResumeCount(0);
                }

            } catch (err) {
                console.error("Dashboard error:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load your dashboard. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const retryLoading = () => {
        window.location.reload();
    };

    // Opens the shared sidebar on mobile.
    const openSidebar = () => {
        window.dispatchEvent(new Event("ci:open-sidebar"));
    };

    const skills = profile?.skills || [];
    const education = profile?.education || [];
    const interests = profile?.interests || [];
    const preferredCareers = profile?.preferredCareer || [];

    // Actual score returned by the Resume Analyzer.
    const resumeScore =
        latestResume?.parsedData?.insights?.resumeScore;

    const hasResumeScore = typeof resumeScore === "number";

    const completedSections = [
        education.length > 0,
        skills.length > 0,
        interests.length > 0,
        preferredCareers.length > 0
    ].filter(Boolean).length;

    const profileCompletion = Math.round(
        (completedSections / 4) * 100
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-logo">
                    <BrainCircuit size={32} />
                </div>
                <div className="loading-spinner" />
                <h2>Preparing your career dashboard</h2>
                <p>Loading your profile and career information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-loading">
                <div className="error-icon">
                    <Clock3 size={30} />
                </div>
                <h2>Something went wrong</h2>
                <p>{error}</p>

                <button
                    className="primary-button"
                    onClick={retryLoading}
                >
                    Try Again <ArrowRight size={17} />
                </button>

                <button
                    className="text-button"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        );
    }

    if (!user || !profile) return null;

    return (
        <div className="dashboard-layout">

            {/* Main content */}
            <main className="dashboard-main">

                {/* Topbar */}
                <header className="dashboard-topbar">
                    <div className="topbar-left">
                        <button
                            className="mobile-menu"
                            onClick={openSidebar}
                            aria-label="Open navigation"
                        >
                            <Menu size={23} />
                        </button>

                        <div className="breadcrumb">
                            <span>Workspace</span>
                            <span className="breadcrumb-divider">/</span>
                            <strong>Dashboard</strong>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <div className="topbar-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search your dashboard..."
                                aria-label="Search dashboard"
                                disabled
                            />
                        </div>

                        <NotificationPanel />

                        <div className="topbar-user">
                            <div className="user-avatar">
                                <UserRound size={23} />
                            </div>

                            <div className="user-details">
                                <strong>{user.name}</strong>
                                <span>{user.role || "Student"}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">

                    {/* Welcome banner */}
                    <section className="welcome-banner">
                        <div className="welcome-content">
                            <div className="welcome-label">
                                <Sparkles size={15} />
                                YOUR PERSONAL CAREER SPACE
                            </div>

                            <h2>
                                Welcome back, {user.name?.split(" ")[0]}!
                            </h2>

                            <h3>
                                Discover your future with <span>AI.</span>
                            </h3>

                            <p>
                                Understand your strengths, explore career opportunities,
                                and build the skills needed to reach your goals.
                            </p>

                            <Link
                                to="/resume-analyzer"
                                className="banner-button"
                            >
                                Explore Resume Analyzer
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="welcome-visual">
                            <div className="visual-glow" />

                            <div className="visual-main-icon">
                                <BrainCircuit
                                    size={100}
                                    strokeWidth={1.2}
                                />
                            </div>

                            <div className="floating-icon floating-icon-one">
                                <ChartLine size={25} />
                            </div>

                            <div className="floating-icon floating-icon-two">
                                <Target size={25} />
                            </div>

                            <div className="floating-icon floating-icon-three">
                                <Sparkles size={22} />
                            </div>
                        </div>
                    </section>

                    {/* Statistics */}
                    <section className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <UserRound size={25} />
                            </div>
                            <div className="stat-info">
                                <p>Profile Completion</p>
                                <h3>{profileCompletion}%</h3>
                                <div className="progress-track">
                                    <div
                                        className="progress-fill purple-fill"
                                        style={{ width: `${profileCompletion}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <BriefcaseBusiness size={25} />
                            </div>
                            <div className="stat-info">
                                <p>Preferred Careers</p>
                                <h3>{preferredCareers.length}</h3>
                                <span className="stat-caption">From your profile</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon cyan">
                                <FileText size={25} />
                            </div>
                            <div className="stat-info">
                                <p>Resume Analysis</p>
                                <h3>{latestResume ? "Completed" : "Not Analyzed"}</h3>
                                <span className="stat-caption">
                                    {latestResume
                                        ? latestResume.fileName
                                        : "Upload your resume to get started"}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon pink">
                                <Target size={25} />
                            </div>
                            <div className="stat-info">
                                <p>Resume Score</p>
                                <h3>
                                    {resumeScore !== undefined && resumeScore !== null
                                        ? `${resumeScore}%`
                                        : "--"}
                                </h3>
                                <span className="stat-caption">
                                    {latestResume
                                        ? "Based on your resume analysis"
                                        : "Analyze your resume to view score"}
                                </span>
                            </div>
                        </div>

                    </section>

                    {/* Resume score action */}
                    {!hasResumeScore && (
                        <section className="dashboard-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>
                                        <FileText size={21} />
                                        Get Your Resume Score
                                    </h3>
                                    <p>
                                        Upload your resume to view your score
                                        and discover areas for improvement.
                                    </p>
                                </div>

                                <Link
                                    to="/resume-analyzer"
                                    className="panel-action"
                                >
                                    Analyze Resume
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Main dashboard panels */}
                    <section className="dashboard-panels">

                        {/* Education */}
                        <div className="dashboard-panel profile-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>
                                        <GraduationCap size={21} />
                                        Education
                                    </h3>
                                    <p>Your academic background</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="panel-action"
                                >
                                    Edit Profile
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>

                            {education.length > 0 ? (
                                <div className="education-list">
                                    {education.map((edu, index) => (
                                        <div
                                            className="education-item"
                                            key={index}
                                        >
                                            <div className="education-icon">
                                                <GraduationCap size={21} />
                                            </div>

                                            <div>
                                                <h4>
                                                    {edu.degree ||
                                                        "Degree not specified"}
                                                </h4>

                                                <p>
                                                    {edu.institution ||
                                                        "Institution not specified"}
                                                </p>

                                                <span>
                                                    {edu.graduationYear ||
                                                        "Year not specified"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <GraduationCap size={28} />
                                    <p>No education details added yet.</p>
                                    <Link to="/profile">
                                        Complete your profile
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Technical Skills */}
                        <div className="dashboard-panel skills-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>
                                        <Code2 size={21} />
                                        Technical Skills
                                    </h3>
                                    <p>Your current skill set</p>
                                </div>

                                <span className="count-label">
                                    {skills.length} skills
                                </span>
                            </div>

                            {skills.length > 0 ? (
                                <div className="skill-tags">
                                    {skills.map((skill, index) => (
                                        <span
                                            className="skill-tag"
                                            key={index}
                                        >
                                            {typeof skill === "string"
                                                ? skill
                                                : skill.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Code2 size={28} />
                                    <p>No skills added yet.</p>
                                    <Link to="/profile">
                                        Add your skills
                                    </Link>
                                </div>
                            )}
                        </div>

                    </section>

                    {/* Interests and Preferred Careers */}
                    <section className="dashboard-panels secondary-panels">

                        {/* Career Interests */}
                        <div className="dashboard-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>
                                        <Sparkles size={21} />
                                        Career Interests
                                    </h3>
                                    <p>Areas you are interested in</p>
                                </div>
                            </div>

                            <div className="simple-list">
                                {interests.length > 0 ? (
                                    interests.map((interest, index) => (
                                        <div
                                            className="simple-list-item"
                                            key={index}
                                        >
                                            <CheckCircle2 size={17} />
                                            {interest}
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted-text">
                                        Add your career interests to your profile.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Preferred Careers */}
                        <div className="dashboard-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>
                                        <Target size={21} />
                                        Preferred Careers
                                    </h3>
                                    <p>Career paths you want to explore</p>
                                </div>
                            </div>

                            <div className="simple-list">
                                {preferredCareers.length > 0 ? (
                                    preferredCareers.map((career, index) => (
                                        <div
                                            className="simple-list-item"
                                            key={index}
                                        >
                                            <ArrowUpRight size={17} />
                                            {career}
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted-text">
                                        Add your preferred careers to your profile.
                                    </p>
                                )}
                            </div>
                        </div>

                    </section>

                    {/* Feature cards */}
                    <section className="tools-section">
                        <div className="section-heading">
                            <div>
                                <h2>Explore Career Tools</h2>
                                <p>
                                    Tools to help you move forward in your career.
                                </p>
                            </div>
                        </div>

                        <div className="tools-grid">

                            <div className="tool-card">
                                <div className="tool-icon blue">
                                    <FileText size={25} />
                                </div>

                                <h3>AI Resume Analyzer</h3>
                                <p>
                                    Upload your resume and extract your skills,
                                    education, and experience using AI.
                                </p>

                                <Link
                                    to="/resume-analyzer"
                                    className="tool-link"
                                >
                                    Analyze Resume
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon purple">
                                    <ChartNoAxesColumnIncreasing size={25} />
                                </div>

                                <h3>Skill Gap Analysis</h3>
                                <p>
                                    Discover the skills you need to develop
                                    for your desired career.
                                </p>

                                <Link
                                    to="/skill-analysis"
                                    className="tool-link"
                                >
                                    Analyze Skills
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon cyan">
                                    <Route size={25} />
                                </div>

                                <h3>Learning Path</h3>
                                <p>
                                    Plan your learning journey with a structured
                                    career development path.
                                </p>

                                <Link
                                    to="/learning-path"
                                    className="tool-link"
                                >
                                    Open Learning Path
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon pink">
                                    <Scale size={25} />
                                </div>

                                <h3>Career Explorer</h3>
                                <p>
                                    Compare career options and understand
                                    their skill requirements.
                                </p>

                                <Link
                                    to="/career-explorer"
                                    className="tool-link"
                                >
                                    Explore Careers
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon blue">
                                    <MessageSquare size={25} />
                                </div>

                                <h3>Mock Interview</h3>
                                <p>
                                    Practice career-specific questions and get
                                    an automated estimate of your answers.
                                </p>

                                <Link
                                    to="/mock-interview"
                                    className="tool-link"
                                >
                                    Start Practice
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon purple">
                                    <ClipboardCheck size={25} />
                                </div>

                                <h3>Assessments</h3>
                                <p>
                                    Take timed skill quizzes and review
                                    explanations.
                                </p>

                                <Link
                                    to="/assessments"
                                    className="tool-link"
                                >
                                    Take a Quiz
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon cyan">
                                    <Award size={25} />
                                </div>

                                <h3>Certificates</h3>
                                <p>
                                    Track your certificates, expiry dates
                                    and the skills they show.
                                </p>

                                <Link
                                    to="/certificates"
                                    className="tool-link"
                                >
                                    Manage Certificates
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon pink">
                                    <CalendarClock size={25} />
                                </div>

                                <h3>Placement Drives</h3>
                                <p>
                                    Check eligibility and deadlines for
                                    sample placement drives.
                                </p>

                                <Link
                                    to="/placement-drives"
                                    className="tool-link"
                                >
                                    View Drives
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                        </div>
                    </section>

                    <footer className="dashboard-footer">
                        <span>
                            © {new Date().getFullYear()} CareerInfinity
                        </span>
                        <span>AI-powered career intelligence</span>
                    </footer>

                </div>
            </main>
        </div>
    );
}

export default Dashboard;
