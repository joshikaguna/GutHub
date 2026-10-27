// src/pages/PatientDashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import StreakCard from "../components/StreakCard";
import {
  Heart,
  Thermometer,
  Activity,
  Radio,
  Pill,
  Utensils,
  Clock,
  Sparkles,
  Plus,
  FileText,
  Wifi,
  ChevronRight,
  TrendingUp,
  Info,
  ShieldCheck,
  AlertCircle,
  Flame,
  Scale,
  BarChart2,
  CheckCircle2,
  Battery,
  RefreshCw,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Measurement,
  Symptom,
  Medication,
  Meal,
  BowelEvent,
  GutPatchSession,
  PersonalInsight,
  PatientProfile,
  DeviceInfo,
} from "../types";
import { storage, INITIAL_PROFILE } from "../services/storage";
import { calculateStreaks } from "../services/streakService";
import { calculatePersonalizedTargets } from "../services/nutritionDb";

type MotilityMetricType = "motility" | "symptom" | "hr";
type TimelineFilterType = "all" | "meals" | "meds" | "gpatch" | "bowel" | "symptoms";

const PatientDashboard: React.FC = () => {
  const [profile] = useState<PatientProfile>(() =>
    storage.get<PatientProfile>("patient_profile", INITIAL_PROFILE)
  );

  const [measurement, setMeasurement] = useState<Measurement>(() =>
    storage.get("measure", {
      timestamp: new Date().toISOString(),
      heartRate: 74,
      skinTemp: 36.6,
      eda: 2.4,
      activity: "Rest",
      smartBandConnected: true,
      gutPatchConnected: true,
      signalQuality: "Optimal",
      movementArtifact: false,
    })
  );

  const [symptoms] = useState<Symptom[]>(() =>
    storage.get<Symptom[]>("symptoms", [])
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    storage.get<Medication[]>("medications", [])
  );
  const [meals] = useState<Meal[]>(() => storage.get<Meal[]>("meals", []));
  const [bowelEvents] = useState<BowelEvent[]>(() =>
    storage.get<BowelEvent[]>("bowel", [])
  );
  const [sessions] = useState<GutPatchSession[]>(() =>
    storage.get<GutPatchSession[]>("gpatch", [])
  );
  const [devices] = useState<DeviceInfo[]>(() =>
    storage.get<DeviceInfo[]>("devices", [])
  );
  const [insights] = useState<PersonalInsight[]>(() =>
    storage.get<PersonalInsight[]>("insights", [])
  );

  // Dashboard interactive state
  const [selectedSensorTab, setSelectedSensorTab] = useState<"acoustic" | "vitals" | "eda">("acoustic");
  const [comparisonMetric, setComparisonMetric] = useState<MotilityMetricType>("motility");
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilterType>("all");

  // Subtle real-time heart rate and skin temperature tick
  useEffect(() => {
    const interval = setInterval(() => {
      setMeasurement((prev) => {
        const hrJitter = (Math.random() - 0.5) * 2;
        const hr = Math.round(Math.min(92, Math.max(66, prev.heartRate + hrJitter)));
        const temp = parseFloat((36.5 + Math.random() * 0.25).toFixed(1));
        const updated: Measurement = {
          ...prev,
          timestamp: new Date().toISOString(),
          heartRate: hr,
          skinTemp: temp,
          eda: parseFloat((2.3 + Math.random() * 0.35).toFixed(2)),
        };
        storage.set("measure", updated);
        return updated;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleQuickMedConfirm = (id: string) => {
    const updated = medications.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: "taken" as const,
          takenAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      return m;
    });
    setMedications(updated);
    storage.set("medications", updated);
  };

  const activeSession = sessions.find((s) => s.status === "Active") || sessions[0];
  const pendingMed = medications.find((m) => m.status !== "taken");
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === "taken").length;

  // Personalized Targets & Today's Nutrition Consumed
  const targets = useMemo(() => calculatePersonalizedTargets(profile), [profile]);
  const todayCalories = useMemo(
    () => meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0),
    [meals]
  );
  const todayProtein = useMemo(
    () => parseFloat(meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0).toFixed(1)),
    [meals]
  );
  const todayFiber = useMemo(
    () => parseFloat(meals.reduce((sum, m) => sum + (m.totalFiber || 0), 0).toFixed(1)),
    [meals]
  );

  // Gamification & Streak calculation
  const streakData = useMemo(
    () => calculateStreaks(meals, medications, sessions),
    [meals, medications, sessions]
  );

  // -------------------------------------------------------------
  // PRE VS POST-MEAL GASTROCOLIC MOTILITY COMPARISON DATA PIPELINE
  // -------------------------------------------------------------
  const comparisonDataset = useMemo(() => {
    let rawSessions = sessions.filter((s) => s.associatedMeal);

    if (rawSessions.length === 0 && sessions.length > 0) {
      rawSessions = sessions.map((s, idx) => {
        const lower = (s.sessionName || "").toLowerCase();
        let meal: "Breakfast" | "Lunch" | "Dinner" | "Snack" = "Breakfast";
        if (lower.includes("lunch")) meal = "Lunch";
        else if (lower.includes("dinner")) meal = "Dinner";
        else if (lower.includes("snack")) meal = "Snack";
        else if (idx === 1) meal = "Lunch";
        else if (idx === 2) meal = "Dinner";
        return {
          ...s,
          associatedMeal: meal,
          preMealAcousticRate: s.preMealAcousticRate ?? 4.8,
          postMealAcousticRate: s.postMealAcousticRate ?? s.acousticEventRate ?? 12.0,
        };
      });
    }

    if (rawSessions.length === 0 && meals.length > 0) {
      return meals.map((m) => {
        const pre = m.preMealAcousticRate ?? 4.8;
        const post = m.postMealAcousticRate ?? 14.5;
        const delta = parseFloat((post - pre).toFixed(1));
        const surge = pre > 0 ? Math.round(((post - pre) / pre) * 100) : 0;
        return {
          name: `${m.type} (${m.time})`,
          meal: m.type,
          time: m.time,
          preMealMotility: pre,
          postMealMotility: post,
          preMealSymptom: m.preMealSymptomSeverity ?? 1,
          postMealSymptom: m.postMealSymptomSeverity ?? 3,
          preMealHr: m.preMealHeartRate ?? 71,
          postMealHr: m.postMealHeartRate ?? 77,
          delta,
          surgePercent: surge,
        };
      });
    }

    return rawSessions.map((s) => {
      const pre = s.preMealAcousticRate && s.preMealAcousticRate > 0 ? s.preMealAcousticRate : 4.8;
      const post =
        s.postMealAcousticRate && s.postMealAcousticRate > 0
          ? s.postMealAcousticRate
          : s.acousticEventRate || 12.0;
      const delta = parseFloat((post - pre).toFixed(1));
      const surge = pre > 0 ? Math.round(((post - pre) / pre) * 100) : 0;

      return {
        id: s.id,
        name: `${s.associatedMeal} (${s.startTime || "Window"})`,
        meal: s.associatedMeal,
        time: s.startTime,
        preMealMotility: pre,
        postMealMotility: post,
        preMealSymptom: s.preMealSymptomSeverity ?? 1,
        postMealSymptom: s.postMealSymptomSeverity ?? 2,
        preMealHr: s.preMealHeartRate ?? 72,
        postMealHr: s.postMealHeartRate ?? 78,
        delta,
        surgePercent: surge,
      };
    });
  }, [sessions, meals]);

  // Dynamic clinical observation calculation
  const dynamicObservation = useMemo(() => {
    if (comparisonDataset.length === 0) {
      return {
        hasData: false,
        text: "No postprandial motility comparisons are recorded yet. Start a session or log a meal to generate comparative acoustic metrics.",
        avgSurge: 0,
        maxSurgeItem: null,
      };
    }

    const totalSurge = comparisonDataset.reduce((sum, item) => sum + item.surgePercent, 0);
    const avgSurge = Math.round(totalSurge / comparisonDataset.length);
    const sortedBySurge = [...comparisonDataset].sort((a, b) => b.surgePercent - a.surgePercent);
    const maxItem = sortedBySurge[0];
    const minItem = sortedBySurge[sortedBySurge.length - 1];

    const highSurge = comparisonDataset.filter((d) => d.surgePercent >= 100);
    const modSurge = comparisonDataset.filter((d) => d.surgePercent < 100);

    let summaryText = "";
    if (highSurge.length === comparisonDataset.length) {
      summaryText = `All recorded meal windows demonstrated physiological gastrocolic reflex activation (mean +${avgSurge}% motility surge). The peak acoustic transit burst occurred during ${maxItem.meal} (${maxItem.preMealMotility} → ${maxItem.postMealMotility} events/min, +${maxItem.surgePercent}%).`;
    } else if (highSurge.length > 0) {
      const highList = highSurge.map((m) => `${m.meal} (+${m.surgePercent}%)`).join(", ");
      const modList = modSurge.map((m) => `${m.meal} (+${m.surgePercent}%)`).join(", ");
      summaryText = `Across ${comparisonDataset.length} monitored meal windows, the mean postprandial gastrocolic motility increase was +${avgSurge}%. Pronounced motility bursts exceeding +100% occurred following ${highList}, while ${modList} exhibited moderate postprandial stimulation (+${minItem.surgePercent}%) consistent with circadian evening downregulation.`;
    } else {
      summaryText = `Recorded meals showed a mean postprandial motility increase of +${avgSurge}%. ${maxItem.meal} produced the strongest peristaltic response (+${maxItem.surgePercent}% over baseline).`;
    }

    return {
      hasData: true,
      text: summaryText,
      avgSurge,
      maxSurgeItem: maxItem,
      minSurgeItem: minItem,
    };
  }, [comparisonDataset]);

  // Sensor intelligence telemetry data points
  const sensorTrendData = [
    { time: "12:00", acoustic: 5.2, strain: 0.1, hr: 71, temp: 36.5, eda: 2.1 },
    { time: "12:30", acoustic: 6.4, strain: 0.3, hr: 73, temp: 36.6, eda: 2.2 },
    { time: "13:00", acoustic: 14.8, strain: 1.1, hr: 82, temp: 36.8, eda: 2.7 },
    { time: "13:30", acoustic: 18.2, strain: 1.8, hr: 80, temp: 36.9, eda: 2.9 },
    { time: "14:00", acoustic: 15.6, strain: 1.5, hr: 76, temp: 36.7, eda: 2.6 },
    { time: "14:30", acoustic: 11.4, strain: 0.9, hr: 74, temp: 36.6, eda: 2.4 },
    { time: "15:00", acoustic: 8.5, strain: 0.6, hr: 72, temp: 36.5, eda: 2.3 },
    { time: "15:30", acoustic: 7.1, strain: 0.4, hr: 73, temp: 36.5, eda: 2.3 },
    { time: "16:00", acoustic: 6.8, strain: 0.3, hr: 71, temp: 36.5, eda: 2.2 },
    { time: "16:30", acoustic: 9.2, strain: 0.5, hr: 75, temp: 36.6, eda: 2.5 },
  ];

  // Combined multimodal timeline items
  const rawTimeline = [
    {
      time: "08:05",
      type: "med" as const,
      category: "meds",
      title: "Polyethylene Glycol 3350 (17g)",
      detail: "Confirmed intake via Smart Medication Box sensor; on-time morning dose.",
      badge: "Adherence 100%",
    },
    {
      time: "08:15",
      type: "meal" as const,
      category: "meals",
      title: "Breakfast: Rolled Oats & Blueberries",
      detail: "350 kcal • 13.7g protein • 12.1g fiber. Low-FODMAP compliant.",
      badge: "Breakfast",
    },
    {
      time: "08:30",
      type: "gpatch" as const,
      category: "gpatch",
      title: "GutPatch Morning Acoustic Surveillance",
      detail: "Postprandial motility burst: 4.8 → 15.2 events/min (+217% surge).",
      badge: "Acoustic +217%",
    },
    {
      time: "09:10",
      type: "bowel" as const,
      category: "bowel",
      title: "Bowel Movement (Bristol Form 4)",
      detail: "Smooth, snake-like soft stool. Normal transit ~55m post-breakfast.",
      badge: "BSFS Type 4",
    },
    {
      time: "12:45",
      type: "meal" as const,
      category: "meals",
      title: "Lunch: Quinoa & Grilled Chicken Bowl",
      detail: "546 kcal • 52.6g protein • 6.2g fiber. Acoustic surveillance active.",
      badge: "Lunch",
    },
    {
      time: "13:30",
      type: "symptom" as const,
      category: "symptoms",
      title: "Symptom: Mild Bloating (Score 4/10)",
      detail: "Abdominal strain sensor recorded peak expansion (+1.8 mm equivalent).",
      badge: "Severity 4/10",
    },
    {
      time: "16:15",
      type: "meal" as const,
      category: "meals",
      title: "Snack: Ripe Banana & Peanut Butter",
      detail: "199 kcal • 5.3g protein • 4.1g fiber. Light energy replenishment.",
      badge: "Snack",
    },
    {
      time: "17:20",
      type: "bowel" as const,
      category: "bowel",
      title: "Bowel Movement (Bristol Form 3)",
      detail: "Sausage-like with cracks. Mild evacuation effort, no sharp discomfort.",
      badge: "BSFS Type 3",
    },
  ];

  const filteredTimeline = useMemo(() => {
    if (timelineFilter === "all") return rawTimeline;
    return rawTimeline.filter((item) => item.category === timelineFilter);
  }, [timelineFilter]);

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* ------------------------------------------------------------- */}
      {/* 1. DISTINCTIVE HERO BANNER: MIDNIGHT EMERALD TO FOREST GRADIENT */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#103B35] via-[#124B40] to-[#176B5B] text-white p-6 sm:p-7 shadow-elevated border border-[#68DCC0]/25">
        {/* Subtle Wave Backdrop Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
            <path d="M0 100 C 100 50, 150 150, 250 80 C 350 10, 380 90, 400 60" stroke="#68DCC0" strokeWidth="4" />
            <path d="M0 130 C 120 70, 180 180, 280 100 C 340 30, 380 120, 400 90" stroke="#DCEFE7" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/guthub-logo.jpg"
              alt="GutHub Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-white p-1 border border-[#68DCC0]/40 shadow-glow-mint flex-shrink-0"
            />
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#68DCC0] tracking-wider uppercase bg-[#68DCC0]/15 px-2.5 py-0.5 rounded-full border border-[#68DCC0]/30 shadow-xs">
                  Active Telemetry Node
                </span>
                <span className="text-xs text-[#DCEFE7]/80">
                  {profile.fullName} • ID #GH-4091 • Monitoring Day 4
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0B2723]/60 border border-[#164E44] text-[#DCEFE7]/80">
                  Low-FODMAP Protocol
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                Digestive Health Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-[#DCEFE7]/85 leading-relaxed">
                Continuous bio-acoustic transit surveillance, gastrocolic motility surge analytics, and validated sensor adherence.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/symptom"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#68DCC0] hover:bg-[#7AE3C9] text-[#103B35] text-xs font-bold transition-all shadow-glow-mint hover:scale-[1.02]"
            >
              <Plus size={15} /> Log Symptom
            </Link>
            <Link
              to="/meals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all backdrop-blur-xs"
            >
              <Utensils size={14} className="text-[#68DCC0]" /> Log Meal / Stool
            </Link>
            <Link
              to="/summary"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white border border-[#68DCC0]/30 text-xs font-semibold transition-all shadow-xs"
            >
              <FileText size={14} className="text-[#68DCC0]" /> Doctor Summary
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FOUR BALANCED BENTO CLINICAL INDICATOR CARDS               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GASTROCOLIC MOTILITY */}
        <Card noPadding className="p-5 flex flex-col justify-between hover:border-emerald/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-grey mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-grey">
                1. Acoustic Motility
              </span>
              <div className="w-7 h-7 rounded-lg bg-sage text-emerald flex items-center justify-center">
                <Radio size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal font-display">
                {activeSession?.acousticEventRate || 15.2}
              </span>
              <span className="text-xs text-slate-grey">events/min</span>
              <span className="text-xs font-bold text-emerald ml-auto bg-sage px-2 py-0.5 rounded-md">
                +{dynamicObservation.avgSurge}% Surge
              </span>
            </div>
            <p className="text-[11.5px] text-slate-grey mt-1.5">
              Normal postprandial motility (8–18/min)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-[11px]">
            <span className="text-slate-grey font-medium">{activeSession?.associatedMeal || "Breakfast"} Window</span>
            <span className="text-emerald font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald animate-subtle-pulse" /> Live Sensor
            </span>
          </div>
        </Card>

        {/* Card 2: AUTONOMIC VITALS */}
        <Card noPadding className="p-5 flex flex-col justify-between hover:border-emerald/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-grey mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-grey">
                2. Wearable Vitals
              </span>
              <div className="w-7 h-7 rounded-lg bg-sakura-pale text-coral-red flex items-center justify-center">
                <Heart size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal font-display">
                {measurement.heartRate}
              </span>
              <span className="text-xs text-slate-grey">bpm</span>
              <span className="text-xs font-bold text-emerald ml-auto bg-sage px-2 py-0.5 rounded-md">Normal Sinus</span>
            </div>
            <div className="flex items-center gap-3 text-[11.5px] text-slate-grey mt-1.5">
              <span>Temp: <strong className="text-charcoal">{measurement.skinTemp}°C</strong></span>
              <span>•</span>
              <span>EDA: <strong className="text-charcoal">{measurement.eda} µS</strong></span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-[11px]">
            <span className="text-slate-grey font-medium">Autonomic Tone</span>
            <span className="text-emerald font-semibold">Resting Parasympathetic</span>
          </div>
        </Card>

        {/* Card 3: MEDICATION ADHERENCE */}
        <Card noPadding className="p-5 flex flex-col justify-between hover:border-emerald/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-grey mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-grey">
                3. Medication Adherence
              </span>
              <div className="w-7 h-7 rounded-lg bg-sage text-emerald flex items-center justify-center">
                <Pill size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal font-display">
                {takenMeds}/{totalMeds}
              </span>
              <span className="text-xs font-bold text-emerald">
                ({totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100}%)
              </span>
              <span className="text-xs font-semibold text-slate-grey ml-auto">100% On-Time</span>
            </div>
            <p className="text-[11.5px] text-slate-grey mt-1.5 truncate">
              {pendingMed ? `Upcoming: ${pendingMed.name}` : "All doses confirmed today"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-[11px]">
            {pendingMed ? (
              <>
                <span className="text-slate-grey font-medium">Due at {pendingMed.scheduledTime}</span>
                <button
                  onClick={() => handleQuickMedConfirm(pendingMed.id)}
                  className="text-xs font-bold text-emerald hover:text-midnight underline"
                >
                  Confirm Dose
                </button>
              </>
            ) : (
              <>
                <span className="text-slate-grey font-medium">SmartBox Sync</span>
                <span className="text-emerald font-bold">Confirmed</span>
              </>
            )}
          </div>
        </Card>

        {/* Card 4: DAILY NUTRITION & BOWEL */}
        <Card noPadding className="p-5 flex flex-col justify-between hover:border-emerald/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-grey mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-grey">
                4. Daily Nutrition
              </span>
              <div className="w-7 h-7 rounded-lg bg-sage text-emerald flex items-center justify-center">
                <Utensils size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal font-display">
                {todayCalories}
              </span>
              <span className="text-xs text-slate-grey">/ {targets.targetCalories} kcal</span>
              <span className="text-xs font-bold text-emerald ml-auto bg-sage px-2 py-0.5 rounded-md">
                {Math.round((todayCalories / targets.targetCalories) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-slate-grey mt-1.5">
              <span>Pro: <strong className="text-charcoal">{todayProtein}g</strong></span>
              <span>•</span>
              <span>Fiber: <strong className="text-charcoal">{todayFiber}g</strong></span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-[11px]">
            <span className="text-slate-grey font-medium">{meals.length} Meals Logged</span>
            <span className="text-charcoal font-bold">{bowelEvents.length} Stool Events (BSFS)</span>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. PRIMARY CLINICAL SECTION: PRE VS POST GASTROCOLIC MOTILITY */}
      {/* ------------------------------------------------------------- */}
      <Card
        title="Pre- vs. Post-Meal Gastrocolic Motility Comparison"
        subtitle="Comparing baseline resting acoustic motility against postprandial gastrocolic response across all recorded meals"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-ivory p-0.5 rounded-xl border border-border-soft text-xs">
              <button
                onClick={() => setComparisonMetric("motility")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  comparisonMetric === "motility"
                    ? "bg-midnight text-white shadow-xs"
                    : "text-slate-grey hover:text-charcoal"
                }`}
              >
                Acoustic Motility (ev/m)
              </button>
              <button
                onClick={() => setComparisonMetric("symptom")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  comparisonMetric === "symptom"
                    ? "bg-midnight text-white shadow-xs"
                    : "text-slate-grey hover:text-charcoal"
                }`}
              >
                Discomfort (0–10)
              </button>
              <button
                onClick={() => setComparisonMetric("hr")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  comparisonMetric === "hr"
                    ? "bg-midnight text-white shadow-xs"
                    : "text-slate-grey hover:text-charcoal"
                }`}
              >
                Autonomic Pulse (bpm)
              </button>
            </div>

            <Link
              to="/comparison"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface hover:bg-sage/40 border border-border-soft text-emerald text-xs font-bold transition-colors shadow-xs"
            >
              Full Analysis <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Top Quick Stats Strip for Recorded Meals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {comparisonDataset.map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-xl bg-ivory border border-border-soft flex flex-col justify-between hover:border-emerald/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-grey">
                  <span className="font-bold text-charcoal">{item.meal}</span>
                  <span className="text-[10px]">{item.time}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-bold text-charcoal font-display">
                    {item.preMealMotility} → {item.postMealMotility}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      item.surgePercent >= 100
                        ? "text-emerald bg-sage"
                        : "text-midnight bg-sage/60"
                    }`}
                  >
                    +{item.surgePercent}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-grey mt-1">
                  Δ +{item.delta} events/min
                </span>
              </div>
            ))}
          </div>

          {/* Grouped Comparison Bar Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonDataset}
                margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  unit={
                    comparisonMetric === "motility"
                      ? " ev/m"
                      : comparisonMetric === "symptom"
                      ? " /10"
                      : " bpm"
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const preVal = Number(payload[0]?.value || 0);
                      const postVal = Number(payload[1]?.value || 0);
                      const diff = parseFloat((postVal - preVal).toFixed(1));
                      const pct = preVal > 0 ? Math.round(((postVal - preVal) / preVal) * 100) : 0;
                      return (
                        <div className="bg-surface p-3.5 rounded-xl border border-border-soft shadow-elevated text-xs space-y-1.5">
                          <p className="font-bold text-charcoal text-sm">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-slate-grey">
                            <span>Pre-Meal Baseline:</span>
                            <strong className="text-charcoal">{preVal}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald font-semibold">
                            <span>Postprandial Response:</span>
                            <strong className="text-emerald">{postVal}</strong>
                          </div>
                          <div className="pt-1.5 border-t border-border-soft flex items-center justify-between gap-4 text-midnight font-bold">
                            <span>Change / Delta:</span>
                            <strong className="text-emerald">
                              +{diff} {comparisonMetric === "motility" ? `(+${pct}%)` : ""}
                            </strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(val) => <span className="text-charcoal font-semibold">{val}</span>}
                />
                {comparisonMetric === "motility" ? (
                  <>
                    <Bar
                      dataKey="preMealMotility"
                      name="Pre-Meal Baseline (events/min)"
                      fill="#103B35"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="postMealMotility"
                      name="Post-Meal Motility (events/min)"
                      fill="#176B5B"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : comparisonMetric === "symptom" ? (
                  <>
                    <Bar
                      dataKey="preMealSymptom"
                      name="Pre-Meal Discomfort Score (0-10)"
                      fill="#DCEFE7"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="postMealSymptom"
                      name="Post-Meal Discomfort Score (0-10)"
                      fill="#E87575"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : (
                  <>
                    <Bar
                      dataKey="preMealHr"
                      name="Pre-Meal Heart Rate (bpm)"
                      fill="#64748B"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="postMealHr"
                      name="Post-Meal Heart Rate (bpm)"
                      fill="#F4B860"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Clinical Motility Observation Box */}
          <div className="p-4 rounded-xl bg-[#F0F7F4] border border-sage text-xs text-charcoal flex items-start gap-3">
            <Sparkles size={17} className="text-emerald flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11.5px] leading-relaxed">
              <p className="text-charcoal">
                <strong className="text-midnight">Calculated Motility Observation:</strong> {dynamicObservation.text}
              </p>
              <p className="text-[10.5px] text-slate-grey">
                Formula: Percentage Change = ((Post-meal − Pre-meal) / Pre-meal) × 100. Derived from bio-acoustic envelope filtering. Simulated research modeling; non-diagnostic.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 4. LIVE SENSOR INTELLIGENCE STREAM                            */}
      {/* ------------------------------------------------------------- */}
      <Card
        title="Live Sensor Intelligence Telemetry"
        subtitle="Continuous multi-sensor telemetry stream aligned with digestive rhythm and postprandial expansion"
        action={
          <div className="flex items-center gap-1 bg-ivory p-0.5 rounded-xl border border-border-soft text-xs">
            <button
              onClick={() => setSelectedSensorTab("acoustic")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedSensorTab === "acoustic"
                  ? "bg-midnight text-white shadow-xs"
                  : "text-slate-grey hover:text-charcoal"
              }`}
            >
              GutPatch Motility
            </button>
            <button
              onClick={() => setSelectedSensorTab("vitals")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedSensorTab === "vitals"
                  ? "bg-midnight text-white shadow-xs"
                  : "text-slate-grey hover:text-charcoal"
              }`}
            >
              Heart Rate & Temp
            </button>
            <button
              onClick={() => setSelectedSensorTab("eda")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedSensorTab === "eda"
                  ? "bg-midnight text-white shadow-xs"
                  : "text-slate-grey hover:text-charcoal"
              }`}
            >
              EDA Conductance
            </button>
          </div>
        }
      >
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            {selectedSensorTab === "acoustic" ? (
              <LineChart data={sensorTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748B" }} tickMargin={6} />
                <YAxis
                  yAxisId="sound"
                  domain={[0, 24]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "Acoustic / min", angle: -90, position: "insideLeft", style: { fontSize: "10px", fill: "#64748B" } }}
                />
                <YAxis
                  yAxisId="strain"
                  orientation="right"
                  domain={[0, 2.5]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "Strain (mm)", angle: 90, position: "insideRight", style: { fontSize: "10px", fill: "#64748B" } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 16px rgba(16, 59, 53, 0.08)",
                  }}
                />
                <Line
                  yAxisId="sound"
                  type="monotone"
                  dataKey="acoustic"
                  name="Acoustic Motility (events/min)"
                  stroke="#176B5B"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#176B5B" }}
                />
                <Line
                  yAxisId="strain"
                  type="monotone"
                  dataKey="strain"
                  name="Strain Expansion (mm)"
                  stroke="#68DCC0"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : selectedSensorTab === "vitals" ? (
              <LineChart data={sensorTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis yAxisId="hr" domain={[60, 100]} tick={{ fontSize: 11, fill: "#64748B" }} unit=" bpm" />
                <YAxis yAxisId="temp" orientation="right" domain={[36.0, 37.5]} tick={{ fontSize: 11, fill: "#64748B" }} unit="°C" />
                <Tooltip />
                <Line yAxisId="hr" type="monotone" dataKey="hr" name="Heart Rate (bpm)" stroke="#E87575" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="temp" type="monotone" dataKey="temp" name="Skin Temp (°C)" stroke="#F4B860" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <AreaChart data={sensorTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis domain={[1.5, 3.5]} tick={{ fontSize: 11, fill: "#64748B" }} unit=" µS" />
                <Tooltip />
                <Area type="monotone" dataKey="eda" name="EDA Conductance (µS)" stroke="#176B5B" fill="#DCEFE7" fillOpacity={0.5} strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 5. PATIENT MOTIVATION & STREAK CONSISTENCY SYSTEM             */}
      {/* ------------------------------------------------------------- */}
      <StreakCard streakData={streakData} />

      {/* ------------------------------------------------------------- */}
      {/* 6. LOWER TWO-COLUMN WORKSPACE: TIMELINE & CLINICAL INSIGHTS   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multimodal Digestive Timeline (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Multimodal Health Timeline"
            subtitle="Chronological alignment of meals, medications, acoustic sessions, and Bristol bowel events"
            action={
              <div className="flex items-center gap-1 bg-ivory p-0.5 rounded-xl border border-border-soft text-xs">
                {(["all", "meals", "meds", "gpatch", "bowel", "symptoms"] as TimelineFilterType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimelineFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                      timelineFilter === tab
                        ? "bg-midnight text-white shadow-xs"
                        : "text-slate-grey hover:text-charcoal"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-12 text-slate-grey font-bold pt-0.5 text-right flex-shrink-0">
                    {item.time}
                  </div>

                  <div className="relative flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 bg-surface ${
                        item.type === "med"
                          ? "border-emerald bg-sage"
                          : item.type === "meal"
                          ? "border-midnight bg-sage"
                          : item.type === "symptom"
                          ? "border-coral-red bg-sakura-pale"
                          : item.type === "gpatch"
                          ? "border-emerald bg-sage"
                          : "border-charcoal bg-ivory"
                      }`}
                    />
                    {idx !== filteredTimeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border-soft mt-1" />
                    )}
                  </div>

                  <div className="flex-1 bg-[#F0F7F4]/60 hover:bg-[#F0F7F4] p-3 rounded-xl border border-sage transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-charcoal">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-sage text-midnight">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-grey mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Personal Clinical Insights & Device Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Personal Clinical Insights"
            subtitle="Machine-observed correlations across sensor telemetry"
            action={
              <Link
                to="/insights"
                className="text-xs text-emerald hover:underline flex items-center gap-1 font-bold"
              >
                All Insights <ChevronRight size={13} />
              </Link>
            }
          >
            <div className="space-y-3">
              {insights.slice(0, 2).map((ins) => (
                <div
                  key={ins.id}
                  className="p-3.5 rounded-xl bg-[#F0F7F4]/70 border border-sage text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald uppercase tracking-wider">
                      {ins.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface border border-sage text-slate-grey font-semibold">
                      {ins.confidence}
                    </span>
                  </div>

                  <h4 className="font-bold text-charcoal text-xs leading-snug">
                    {ins.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-grey leading-relaxed">
                    {ins.summary}
                  </p>

                  <div className="p-2.5 rounded-lg bg-surface border border-sage/80 text-[10.5px] text-slate-grey">
                    <strong className="text-midnight">Sensor Evidence:</strong> {ins.evidence}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Connected Sensor Hardware Health */}
          <div className="bg-surface rounded-xl border border-border-soft p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal uppercase tracking-wider text-[11px]">
                Hardware Nodes & Telemetry
              </span>
              <span className="text-[10.5px] font-bold text-emerald flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald animate-subtle-pulse" /> All Systems Online
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {devices.slice(0, 2).map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-ivory border border-border-soft flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sage text-emerald flex items-center justify-center">
                      <Radio size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-charcoal text-xs">{dev.name}</div>
                      <div className="text-[10px] text-slate-grey">{dev.dataSource} • {dev.firmware}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald">{dev.battery}%</span>
                    <div className="text-[9.5px] text-slate-grey font-medium">{dev.signalStrengthDbm} dBm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
