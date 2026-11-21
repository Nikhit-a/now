
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
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#10213a",
                        color: "#e8eefb",
                        border: "1px solid rgba(148, 170, 205, 0.18)",
                        fontSize: "13px",
                        borderRadius: "10px",
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
                    },
                    success: {
                        iconTheme: { primary: "#34d399", secondary: "#10213a" },
                    },
                    error: {
                        iconTheme: { primary: "#f87171", secondary: "#10213a" },
                    },
                }}
            />

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
                        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                        <Route path="/career-explorer" element={<CareerExplorer />} />
                        <Route path="/skill-analysis" element={<SkillAnalysis />} />
                        <Route path="/learning-path" element={<LearningPath />} />
                        <Route path="/mock-interview" element={<MockInterview />} />
                        <Route path="/job-recommendations" element={<JobRecommendations />} />
                        <Route path="/assessments" element={<Assessments />} />
                        <Route path="/certificates" element={<Certificates />} />
                        <Route path="/placement-drives" element={<PlacementDrives />} />
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
