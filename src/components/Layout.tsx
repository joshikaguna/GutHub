// src/components/Layout.tsx
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  Activity,
  Heart,
  Pill,
  Utensils,
  Radio,
  Clock,
  Sparkles,
  FileText,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  RotateCcw,
  User,
  Sliders,
  ChevronRight,
} from "lucide-react";
import NavItem from "./NavItem";
import { storage } from "../services/storage";
import { PatientProfile } from "../types";

interface LayoutProps {
  auth: {
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
  };
  children: React.ReactNode;
}

interface NavSection {
  title: string;
  items: {
    to: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { to: "/patient", label: "Patient Dashboard", icon: <LayoutDashboard size={16} /> },
      { to: "/live", label: "Live Telemetry", icon: <Activity size={16} />, badge: "Live" },
    ],
  },
  {
    title: "HEALTH TRACKING",
    items: [
      { to: "/symptom", label: "Symptom Journal", icon: <Heart size={16} /> },
      { to: "/medication", label: "Medication Adherence", icon: <Pill size={16} /> },
      { to: "/meals", label: "Meals & Bowel Events", icon: <Utensils size={16} />, badge: "Nutrition" },
      { to: "/gpatch", label: "GutPatch Monitoring", icon: <Radio size={16} />, badge: "Acoustic" },
      { to: "/timeline", label: "Daily Health Timeline", icon: <Clock size={16} /> },
    ],
  },
  {
    title: "INTELLIGENCE & CLINICAL",
    items: [
      { to: "/insights", label: "Personal Insights", icon: <Sparkles size={16} /> },
      { to: "/summary", label: "Doctor Summary", icon: <FileText size={16} />, badge: "Report" },
      { to: "/profile", label: "Profile & Targets", icon: <User size={16} /> },
      { to: "/devices", label: "Device Management", icon: <Sliders size={16} /> },
    ],
  },
];

const mobileBottomNav = [
  { to: "/patient", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { to: "/symptom", label: "Symptoms", icon: <Heart size={18} /> },
  { to: "/meals", label: "Meals", icon: <Utensils size={18} /> },
  { to: "/gpatch", label: "GutPatch", icon: <Radio size={18} /> },
  { to: "/summary", label: "Doctor", icon: <FileText size={18} /> },
];

const Layout: React.FC<LayoutProps> = ({ auth, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const profile = storage.get<PatientProfile | null>("patient_profile", null);
  const displayName = profile?.fullName || "Alex Morgan";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // If on login route, render bare layout
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  const handleResetData = () => {
    if (window.confirm("Reset all demonstration records to initial demo dataset?")) {
      storage.resetDemoData();
      window.location.reload();
    }
  };

  // Derive current page title
  const getCurrentTitle = () => {
    for (const section of navSections) {
      const match = section.items.find((item) => item.to === location.pathname);
      if (match) return match.label;
    }
    if (location.pathname === "/profile") return "Patient Profile & Targets";
    if (location.pathname === "/comparison") return "Pre- vs. Post-Meal Gastrointestinal Comparison";
    return "Digestive Health Intelligence";
  };

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-xs md:hidden transition-opacity print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* PREMIUM SIDEBAR: DEEP MIDNIGHT GREEN (#103B35)                */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[252px] bg-midnight border-r border-[#0B2723] flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static print:hidden shadow-elevated ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand & Identity */}
        <div>
          <div className="px-5 py-4 border-b border-[#164E44]/70">
            <div className="flex items-center justify-between">
              <Link to="/patient" className="flex items-center gap-2.5 group">
                {/* Official GutHub Brand Logo */}
                <img
                  src="/guthub-logo.jpg"
                  alt="GutHub Logo"
                  className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 border border-[#68DCC0]/40 shadow-glow-mint transition-transform group-hover:scale-105"
                />
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white leading-none font-display">
                    Gut<span className="text-[#68DCC0]">Hub</span>
                  </h1>
                  <p className="text-[8.5px] font-semibold tracking-wider text-[#DCEFE7]/70 uppercase mt-0.5">
                    DIGESTIVE HEALTH INTELLIGENCE
                  </p>
                </div>
              </Link>
              <button
                className="md:hidden p-1 rounded-md text-[#DCEFE7]/70 hover:bg-[#164E44]"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Styled Patient Profile Card in Sidebar */}
            <Link
              to="/profile"
              className="mt-3.5 p-2 rounded-xl bg-[#0B2723]/80 hover:bg-[#0B2723] border border-[#164E44] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#176B5B] border border-[#68DCC0]/40 text-[#68DCC0] font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:border-[#68DCC0]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate leading-tight group-hover:text-[#68DCC0] transition-colors">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-[#DCEFE7]/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#68DCC0] animate-subtle-pulse" />
                    <span className="truncate">#GH-4091 • Monitoring</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={13} className="text-[#DCEFE7]/50 group-hover:text-[#68DCC0] transition-colors" />
            </Link>
          </div>

          {/* Navigation Sections */}
          <div className="px-3 py-3 overflow-y-auto max-h-[calc(100vh-230px)] space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[9.5px] uppercase tracking-wider font-bold text-[#DCEFE7]/55 px-2.5 py-1">
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    badge={item.badge}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Device Status & Session Exit */}
        <div className="p-3 border-t border-[#164E44]/70 bg-[#0B2723]/90">
          {/* Subtle Device Connectivity Strip */}
          <div className="bg-[#103B35] rounded-lg p-2 mb-2 border border-[#164E44] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#68DCC0] animate-subtle-pulse" />
              <span className="font-semibold text-white">2 Sensors Paired</span>
            </div>
            <span className="text-[10px] text-[#DCEFE7]/70">BLE 2.4GHz</span>
          </div>

          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleResetData}
              className="text-[11px] text-[#DCEFE7]/70 hover:text-white flex items-center gap-1 transition-colors"
              title="Reset demonstration records"
            >
              <RotateCcw size={12} /> Reset Data
            </button>
            <button
              onClick={auth.logout}
              className="text-[11px] text-[#E87575] hover:underline flex items-center gap-1 transition-colors font-semibold"
            >
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Compact Top Header */}
        <header className="bg-surface border-b border-border-soft px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 print:hidden z-10 shadow-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-1.5 rounded-lg text-charcoal hover:bg-sage/40 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-grey hidden sm:inline">
                  GutHub /
                </span>
                <h2 className="text-sm sm:text-base font-bold text-charcoal truncate font-display">
                  {getCurrentTitle()}
                </h2>
              </div>
            </div>
          </div>

          {/* Patient Context & Live Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Telemetry Pulse Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage text-midnight text-[11px] font-semibold border border-emerald/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-subtle-pulse" />
              <span className="hidden xs:inline">Telemetry Active</span>
              <span className="xs:hidden">Live</span>
            </div>

            {/* Profile Link Pill */}
            <Link
              to="/profile"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface hover:bg-sage/30 text-charcoal border border-border-soft text-xs font-semibold transition-colors shadow-xs"
            >
              <User size={13} className="text-slate-grey" />
              <span>{displayName.split(" ")[0]}</span>
            </Link>

            {/* Direct Doctor Summary Link */}
            <Link
              to="/summary"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald hover:bg-emerald-hover text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">Doctor Summary</span>
            </Link>
          </div>
        </header>

        {/* Clinical Research Context Subtle Top Strip */}
        <div className="bg-[#F0F7F4] border-b border-sage px-4 sm:px-6 py-1.5 text-[11px] text-charcoal flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldAlert size={13} className="text-emerald flex-shrink-0" />
            <span className="truncate">
              <strong>MEDAITHON '26 Platform:</strong> Acoustic peristalsis & adherence records are demonstrated via continuous biosensor telemetry.
            </span>
          </div>
          <span className="hidden lg:inline text-[10px] text-slate-grey font-semibold flex-shrink-0">
            Non-Diagnostic Research Interface
          </span>
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 pb-20 md:pb-8 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border-soft flex items-center justify-around py-1.5 px-1 print:hidden">
          {mobileBottomNav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10.5px] transition-colors ${
                  isActive ? "text-emerald font-bold" : "text-slate-grey hover:text-charcoal"
                }`}
              >
                {item.icon}
                <span className="mt-0.5 leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
