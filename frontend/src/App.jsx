
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import PlaceholderPage from "./pages/PlaceholderPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import CareerExplorer from "./pages/CareerExplorer";
import SkillAnalysis from "./pages/SkillAnalysis";
import LearningPath from "./pages/LearningPath";
import MockInterview from "./pages/MockInterview";
import InterviewPreparation from "./pages/InterviewPreparation";
import Notifications from "./pages/Notifications";

import JobRecommendations from "./pages/JobRecommendations";
import Assessments from "./pages/Assessments";
import Certificates from "./pages/Certificates";
import PlacementDrives from "./pages/PlacementDrives";
import HelpSupport from "./pages/HelpSupport";
import Settings from "./pages/Settings";

import { navigationItems } from "./config/navigation";

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>

                        {/* Dashboard */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Profile */}
                        <Route path="/profile" element={<Profile />} />

                        {/* Career & Resume */}
                        <Route
                            path="/resume-analyzer"
                            element={<ResumeAnalyzer />}
                        />
                        <Route
                            path="/career-explorer"
                            element={<CareerExplorer />}
                        />
                        <Route
                            path="/skill-analysis"
                            element={<SkillAnalysis />}
                        />
                        <Route
                            path="/learning-path"
                            element={<LearningPath />}
                        />

                        {/* Interview Module */}
                        <Route
                            path="/mock-interview"
                            element={<MockInterview />}
                        />
                        <Route
                            path="/interview-preparation"
                            element={<InterviewPreparation />}
                        />

                        {/* Notifications */}
                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />

                        {/* Jobs & Assessments */}
                        <Route
                            path="/job-recommendations"
                            element={<JobRecommendations />}
                        />
                        <Route
                            path="/assessments"
                            element={<Assessments />}
                        />
                        <Route
                            path="/certificates"
                            element={<Certificates />}
                        />
                        <Route
                            path="/placement-drives"
                            element={<PlacementDrives />}
                        />

                        {/* Support & Settings */}
                        <Route path="/help" element={<HelpSupport />} />
                        <Route path="/settings" element={<Settings />} />

                        {/* Existing Placeholder Pages */}
                        {navigationItems
                            .filter((item) => item.placeholder)
                            .map((item) => (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    element={
                                        <PlaceholderPage
                                            title={item.label}
                                            description={item.description}
                                            icon={item.icon}
                                            features={item.features}
                                        />
                                    }
                                />
                            ))}

                    </Route>
                </Route>

                {/* Unknown Routes */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
