// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PatientProfilePage from "./pages/PatientProfilePage";
import PatientDashboard from "./pages/PatientDashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import SymptomReporting from "./pages/SymptomReporting";
import MedicationManagement from "./pages/MedicationManagement";
import MealsBowel from "./pages/MealsBowel";
import GutPatchMonitoring from "./pages/GutPatchMonitoring";
import PrePostMealComparison from "./pages/PrePostMealComparison";
import DailyTimeline from "./pages/DailyTimeline";
import PersonalInsights from "./pages/PersonalInsights";
import DeviceManagement from "./pages/DeviceManagement";
import DoctorSummarySheet from "./pages/DoctorSummarySheet";
import Layout from "./components/Layout";
import { storage } from "./services/storage";
import { PatientProfile } from "./types";

// Simple auth simulation using localStorage
const useAuth = () => {
  const [role, setRole] = React.useState<string | null>(() => {
    return localStorage.getItem("guthub_role") || "patient";
  });

  const login = (newRole: string = "patient") => {
    localStorage.setItem("guthub_role", newRole);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem("guthub_role");
    setRole(null);
  };

  return { role, login, logout };
};

const App: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();

  const profile = storage.get<PatientProfile | null>("patient_profile", null);
  const isOnboarded = profile?.onboardingCompleted === true;

  // Protect all routes except login
  const isProtected = location.pathname !== "/login" && !auth.role;
  if (isProtected) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if authenticated but onboarding is incomplete
  if (auth.role && !isOnboarded && location.pathname !== "/onboarding" && location.pathname !== "/login") {
    return <Navigate to="/onboarding" replace />;
  }

  // Onboarding page has its own standalone presentation
  if (location.pathname === "/onboarding") {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Layout auth={auth}>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={auth.login} />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/profile" element={<PatientProfilePage />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/symptom" element={<SymptomReporting />} />
        <Route path="/medication" element={<MedicationManagement />} />
        <Route path="/meals" element={<MealsBowel />} />
        <Route path="/gpatch" element={<GutPatchMonitoring />} />
        <Route path="/comparison" element={<PrePostMealComparison />} />
        <Route path="/timeline" element={<DailyTimeline />} />
        <Route path="/insights" element={<PersonalInsights />} />
        <Route path="/devices" element={<DeviceManagement />} />
        <Route path="/summary" element={<DoctorSummarySheet />} />
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
