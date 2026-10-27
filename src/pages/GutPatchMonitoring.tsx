// src/pages/GutPatchMonitoring.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import {
  Radio,
  Clock,
  Play,
  Square,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Info,
  Sliders,
  Utensils,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Trash2,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { GutPatchSession } from "../types";
import { storage } from "../services/storage";

const MEAL_CATEGORIES: ("Breakfast" | "Lunch" | "Dinner" | "Snack")[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

const TIME_PERIODS: ("Morning" | "Afternoon" | "Evening" | "Night")[] = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

const GutPatchMonitoring: React.FC = () => {
  const [sessions, setSessions] = useState<GutPatchSession[]>(() =>
    storage.get<GutPatchSession[]>("gpatch", [])
  );

  const [activeSessionId, setActiveSessionId] = useState<string>(
    sessions.find((s) => s.status === "Active")?.id || sessions[0]?.id || ""
  );
  const [simulatedArtifact, setSimulatedArtifact] = useState<boolean>(false);

  // New Session Modal / Form State
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [selectedPeriod, setSelectedPeriod] = useState<"Morning" | "Afternoon" | "Evening" | "Night">("Morning");
  const [preMealRate, setPreMealRate] = useState<number>(4.8);
  const [postMealRate, setPostMealRate] = useState<number>(14.5);
  const [preMealSev, setPreMealSev] = useState<number>(1);
  const [postMealSev, setPostMealSev] = useState<number>(3);
  const [customSessionNotes, setCustomSessionNotes] = useState<string>("");

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleStartNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const todayStr = new Date().toISOString().split("T")[0];

    const newSession: GutPatchSession = {
      id: "session-" + Date.now(),
      sessionName: `${selectedPeriod} Postprandial Window (${selectedMeal})`,
      associatedMeal: selectedMeal,
      timePeriod: selectedPeriod,
      startTime: timeNow,
      date: todayStr,
      status: "Active",
      acousticEventRate: postMealRate,
      abdominalExpansionTrend: [
        { minute: 0, expansion: 0.1, soundRate: preMealRate },
        { minute: 15, expansion: 0.4, soundRate: parseFloat((preMealRate + 2.5).toFixed(1)) },
        { minute: 30, expansion: 0.9, soundRate: parseFloat((preMealRate + 6.8).toFixed(1)) },
        { minute: 45, expansion: 1.4, soundRate: postMealRate },
        { minute: 60, expansion: 1.2, soundRate: parseFloat((postMealRate - 1.5).toFixed(1)) },
      ],
      signalQuality: "Optimal",
      movementArtifact: false,
      preMealAcousticRate: preMealRate,
      postMealAcousticRate: postMealRate,
      preMealSymptomSeverity: preMealSev,
      postMealSymptomSeverity: postMealSev,
      preMealHeartRate: 72,
      postMealHeartRate: 78,
      notes: customSessionNotes.trim() || `Real-time bio-acoustic recording window following ${selectedMeal}.`,
      simulated: true,
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    storage.set("gpatch", updated);
    setShowNewModal(false);
    setCustomSessionNotes("");
  };

  const handleEndSession = () => {
    if (!currentSession) return;
    const updated = sessions.map((s) => {
      if (s.id === currentSession.id) {
        return {
          ...s,
          status: "Completed" as const,
          endTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      return s;
    });
    setSessions(updated);
    storage.set("gpatch", updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    storage.set("gpatch", updated);
    if (activeSessionId === id && updated.length > 0) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Structured Pre vs Post Comparison across major meals (Breakfast, Lunch, Dinner, Snack)
  const comparisonData = React.useMemo(() => {
    let validSessions = sessions.filter((s) => s.associatedMeal);

    // Defensive fallback: If sessions exist but lack explicit associatedMeal, infer from sessionName
    if (validSessions.length === 0 && sessions.length > 0) {
      validSessions = sessions.map((s, idx) => {
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

    return validSessions.map((s) => {
      const pre = s.preMealAcousticRate && s.preMealAcousticRate > 0 ? s.preMealAcousticRate : 4.8;
      const post =
        s.postMealAcousticRate && s.postMealAcousticRate > 0
          ? s.postMealAcousticRate
          : s.acousticEventRate || 12.0;
      const delta = parseFloat((post - pre).toFixed(1));
      const surgePercent = Math.round(((post - pre) / pre) * 100);

      return {
        id: s.id,
        name: `${s.associatedMeal} (${s.timePeriod || "Window"})`,
        meal: s.associatedMeal,
        timePeriod: s.timePeriod,
        startTime: s.startTime,
        preMeal: pre,
        postMeal: post,
        delta,
        surgePercent,
        simulated: s.simulated !== false,
      };
    });
  }, [sessions]);

  // Dynamically calculated clinical summary based on actual plotted data
  const dynamicClinicalSummary = React.useMemo(() => {
    if (comparisonData.length === 0) {
      return {
        hasData: false,
        text: "No postprandial motility comparisons are recorded yet. Start a session or log a meal to generate comparative acoustic metrics.",
        avgSurge: 0,
        maxItem: null,
      };
    }

    const totalSurge = comparisonData.reduce((acc, item) => acc + item.surgePercent, 0);
    const avgSurge = Math.round(totalSurge / comparisonData.length);
    const maxItem = [...comparisonData].sort((a, b) => b.surgePercent - a.surgePercent)[0];
    const minItem = [...comparisonData].sort((a, b) => a.surgePercent - b.surgePercent)[0];

    const mealsWithHighSurge = comparisonData.filter((d) => d.surgePercent >= 100);
    const mealsWithModerateSurge = comparisonData.filter((d) => d.surgePercent < 100);

    let narrative = "";
    if (mealsWithHighSurge.length === comparisonData.length) {
      narrative = `All recorded meal windows demonstrated pronounced gastrocolic reflex activation (average +${avgSurge}% motility surge). Peak motility response occurred during ${maxItem.meal} (${maxItem.preMeal} → ${maxItem.postMeal} events/min, +${maxItem.surgePercent}%).`;
    } else if (mealsWithHighSurge.length > 0) {
      const highMealNames = mealsWithHighSurge.map((m) => `${m.meal} (+${m.surgePercent}%)`).join(", ");
      const modMealNames = mealsWithModerateSurge.map((m) => `${m.meal} (+${m.surgePercent}%)`).join(", ");
      narrative = `Across ${comparisonData.length} monitored meal windows, the average postprandial motility surge was +${avgSurge}%. Gastrocolic bursts exceeding +100% were observed during ${highMealNames}, whereas ${modMealNames} exhibited a moderate physiological response (+${minItem.surgePercent}% to ${minItem.postMeal} ev/min).`;
    } else {
      narrative = `Recorded meals showed an average postprandial motility increase of +${avgSurge}%. ${maxItem.meal} produced the strongest peristaltic stimulation (+${maxItem.surgePercent}% from baseline).`;
    }

    return {
      hasData: true,
      text: narrative,
      avgSurge,
      maxItem,
    };
  }, [comparisonData]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-japan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-japan" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-deep">
              GutPatch Bio-Acoustic Prototype
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-light text-teal-dark border border-teal-japan/20">
              Wearable Research Node
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Non-Invasive Peristalsis & Acoustic Motility
          </h1>
          <p className="text-xs text-slate-muted">
            Continuous acoustic contact sensing captures digestive sound rates across Breakfast, Lunch, Dinner, and Snacks
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Link to Pre- vs. Post-Meal Gastrointestinal Comparison */}
          <Link
            to="/comparison"
            className="px-3.5 py-1.5 rounded-lg bg-teal-light hover:bg-[#DDF0EB] text-teal-dark border border-teal-japan/30 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <BarChart2 size={13} className="text-teal-japan" />
            <span>Pre vs Post-Meal Analysis</span>
            <ArrowRight size={13} />
          </Link>

          <button
            onClick={() => setSimulatedArtifact(!simulatedArtifact)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              simulatedArtifact
                ? "bg-amber-muted/15 text-amber-muted border-amber-muted/40"
                : "bg-surface text-slate-muted border-border-soft hover:bg-bg-ivory"
            }`}
          >
            <AlertTriangle size={13} />
            {simulatedArtifact ? "Clear Artifact" : "Simulate Motion Artifact"}
          </button>

          {currentSession?.status === "Active" ? (
            <button
              onClick={handleEndSession}
              className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-bg-ivory border border-coral-refined/40 text-coral-refined text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Square size={13} /> End Current Session
            </button>
          ) : (
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Play size={13} /> Record New Meal Session
            </button>
          )}
        </div>
      </div>

      {/* Start Recording Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-navy-deep/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border-soft p-6 max-w-lg w-full shadow-lg space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-light text-teal-dark text-[11px] font-semibold mb-1">
                <Utensils size={13} /> Initiate Acoustic Motility Window
              </div>
              <h2 className="text-lg font-bold text-navy-deep font-display">
                Start GutPatch Recording Session
              </h2>
              <p className="text-xs text-slate-muted">
                Associate this recording with a meal category (Breakfast, Lunch, Dinner, Snack) and time period to measure gastrocolic acoustic response.
              </p>
            </div>

            <form onSubmit={handleStartNewSession} className="space-y-4">
              {/* Meal Category Selection (All 4 supported) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  1. Associated Meal Category *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedMeal(cat);
                        if (cat === "Breakfast") setSelectedPeriod("Morning");
                        else if (cat === "Lunch") setSelectedPeriod("Afternoon");
                        else if (cat === "Dinner") setSelectedPeriod("Evening");
                        else setSelectedPeriod("Afternoon");
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                        selectedMeal === cat
                          ? "bg-teal-japan text-white border-teal-japan shadow-xs font-semibold"
                          : "bg-bg-ivory text-navy-deep border-border-soft hover:bg-surface"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Period Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  2. Distinct Time Period *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_PERIODS.map((period) => {
                    const isSel = selectedPeriod === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setSelectedPeriod(period)}
                        className={`py-2 px-2 rounded-lg text-xs border text-center transition-all flex items-center justify-center gap-1.5 ${
                          isSel
                            ? "bg-teal-light text-teal-dark border-teal-japan/50 font-semibold shadow-xs"
                            : "bg-surface text-navy-deep border-border-soft hover:bg-bg-ivory"
                        }`}
                      >
                        {period === "Morning" && <Sunrise size={12} />}
                        {period === "Afternoon" && <Sun size={12} />}
                        {period === "Evening" && <Sunset size={12} />}
                        {period === "Night" && <Moon size={12} />}
                        <span>{period}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pre vs Post Meal Expected Acoustic Rates */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-bg-ivory border border-border-soft">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-muted mb-1">
                    Pre-Meal Acoustic Rate
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="30"
                      value={preMealRate}
                      onChange={(e) => setPreMealRate(parseFloat(e.target.value) || 4.5)}
                      className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-muted">ev/m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-muted mb-1">
                    Target Postprandial Rate
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="35"
                      value={postMealRate}
                      onChange={(e) => setPostMealRate(parseFloat(e.target.value) || 14.0)}
                      className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-muted">ev/m</span>
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Clinical Session Notes (Optional)
                </label>
                <textarea
                  value={customSessionNotes}
                  onChange={(e) => setCustomSessionNotes(e.target.value)}
                  placeholder="e.g. Patient logged high-soluble fiber breakfast; seated resting posture for 45 min..."
                  rows={2}
                  className="w-full rounded-lg border border-border-soft p-2.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg border border-border-soft text-slate-muted hover:bg-bg-ivory text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Play size={13} /> Start Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Artifact Alert */}
      {simulatedArtifact && (
        <div className="bg-surface border border-amber-muted/40 p-4 rounded-xl shadow-subtle flex items-start gap-3 text-xs text-navy-deep">
          <AlertTriangle size={17} className="text-amber-muted flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-navy-deep font-semibold">
              Motion-Artifact Warning: Abdominal Sensor Displacement
            </strong>
            <p className="mt-0.5 text-slate-muted leading-relaxed">
              High ambulatory acceleration detected. Active bandpass audio filters are isolating peristaltic sound burst clusters (&lt;500 Hz) from gross body movement. Keep patient seated for optimal signal quality.
            </p>
          </div>
        </div>
      )}

      {/* Key Motility Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-muted mb-1">
            <span className="font-medium">Acoustic Event Rate</span>
            <Activity size={14} className="text-teal-japan" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            {currentSession?.acousticEventRate || 12.8}{" "}
            <span className="text-xs font-normal text-slate-muted">events/min</span>
          </div>
          <p className="text-[10px] text-forest-green font-medium mt-1">
            Normal postprandial motility (8–18/min)
          </p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-muted mb-1">
            <span className="font-medium">Active Meal Context</span>
            <Utensils size={14} className="text-teal-japan" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            {currentSession?.associatedMeal || "Breakfast"}
          </div>
          <p className="text-[10px] text-slate-muted mt-1">
            {currentSession?.timePeriod || "Morning"} recording window
          </p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-muted mb-1">
            <span className="font-medium">Signal Integrity</span>
            <Radio size={14} className="text-forest-green" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-forest-green font-display">
            {simulatedArtifact ? "Artifact-Detected" : currentSession?.signalQuality || "Optimal"}
          </div>
          <p className="text-[10px] text-slate-muted mt-1">
            Acoustic contact SNR: {simulatedArtifact ? "14.2 dB (Degraded)" : "26.4 dB (Clinical)"}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-muted mb-1">
            <span className="font-medium">Gastrocolic Surge</span>
            <Layers size={14} className="text-teal-japan" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            +
            {currentSession && currentSession.preMealAcousticRate > 0
              ? (
                  ((currentSession.postMealAcousticRate - currentSession.preMealAcousticRate) /
                    currentSession.preMealAcousticRate) *
                  100
                ).toFixed(0)
              : "216"}
            %
          </div>
          <p className="text-[10px] text-slate-muted mt-1">Post vs Pre-meal motility surge</p>
        </div>
      </div>

      {/* Main Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Expansion & Sound Rate Graph (8 cols) */}
        <div className="lg:col-span-8">
          <Card
            title={currentSession?.sessionName || "Active Bio-Acoustic Motility Window"}
            subtitle={`Started at ${currentSession?.startTime || "--"} • ${currentSession?.associatedMeal || "Breakfast"} (${currentSession?.timePeriod || "Morning"})`}
            action={
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  currentSession?.status === "Active"
                    ? "bg-teal-light text-teal-dark border-teal-japan/30"
                    : "bg-bg-ivory text-slate-muted border-border-soft"
                }`}
              >
                {currentSession?.status || "Completed"}
              </span>
            }
          >
            {sessions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-muted space-y-2">
                <Radio size={32} className="mx-auto text-slate-muted/40" />
                <p className="font-semibold text-navy-deep">No GutPatch sessions recorded yet.</p>
                <p className="text-[11px]">Click "Record New Meal Session" to initiate bio-acoustic monitoring.</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-2 px-4 py-2 rounded-lg bg-teal-japan text-white text-xs font-semibold shadow-xs"
                >
                  Start Recording
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={currentSession?.abdominalExpansionTrend || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                      <XAxis
                        dataKey="minute"
                        stroke="#687985"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        unit="m"
                      />
                      <YAxis stroke="#687985" tick={{ fontSize: 10 }} tickLine={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface p-2.5 rounded-xl border border-border-soft shadow-md text-xs space-y-1">
                                <p className="font-semibold text-navy-deep">Minute {label} post-meal</p>
                                <p className="text-teal-japan">
                                  Bowel Sound Rate: <strong>{payload[0].value} events/min</strong>
                                </p>
                                {payload[1] && (
                                  <p className="text-slate-muted">
                                    Strain Expansion: <strong>+{payload[1].value} mm</strong>
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="soundRate"
                        name="Bowel Sound Rate (events/min)"
                        stroke="#176B5B"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "#176B5B" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expansion"
                        name="Abdominal Strain Expansion (mm)"
                        stroke="#68DCC0"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-bg-ivory/80 rounded-lg border border-border-soft text-xs text-navy-deep flex items-start gap-2">
                  <Info size={15} className="text-teal-japan flex-shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-slate-muted leading-relaxed">
                    <strong>Session Observations:</strong> {currentSession?.notes}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Session Switcher & Past Windows (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title="Recorded Meal Sessions"
            subtitle={`${sessions.length} acoustic surveillance windows`}
            action={
              <button
                onClick={() => setShowNewModal(true)}
                className="text-xs text-teal-japan hover:underline font-semibold flex items-center gap-1"
              >
                + New
              </button>
            }
          >
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = sess.id === currentSession?.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-teal-light/50 border-teal-japan/50 shadow-xs"
                        : "bg-surface hover:bg-bg-ivory border-border-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-navy-deep">
                          {sess.associatedMeal || sess.sessionName.split(" ")[0]}
                        </span>
                        <span className="text-[10px] text-slate-muted px-1.5 py-0.2 rounded bg-bg-ivory border border-border-soft">
                          {sess.timePeriod || "Window"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            sess.status === "Active"
                              ? "bg-teal-japan text-white"
                              : "bg-bg-ivory text-slate-muted"
                          }`}
                        >
                          {sess.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(sess.id);
                          }}
                          className="text-slate-muted/40 hover:text-coral-refined p-0.5"
                          title="Delete session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10.5px] text-slate-muted mt-1 flex items-center justify-between">
                      <span>Time: {sess.startTime} {sess.endTime ? `– ${sess.endTime}` : ""}</span>
                      <span className="text-teal-dark font-medium">{sess.acousticEventRate} ev/min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Before-and-After Meal Motility Comparison (Breakfast, Lunch, Dinner, Snack) */}
      <Card
        title="Pre vs Post-Meal Gastrocolic Motility Comparison"
        subtitle="Comparing baseline resting motility against postprandial acoustic response across all recorded meals"
        action={
          <div className="flex items-center gap-2">
            {dynamicClinicalSummary.hasData && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-light text-teal-dark text-[11px] font-semibold border border-teal-japan/20">
                Avg Response: +{dynamicClinicalSummary.avgSurge}%
              </span>
            )}
            <Link
              to="/comparison"
              className="text-xs text-teal-japan hover:underline flex items-center gap-1 font-semibold"
            >
              Launch Full Analysis <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        {comparisonData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-muted space-y-2">
            <BarChart2 size={32} className="mx-auto text-slate-muted/40" />
            <p className="font-semibold text-navy-deep">No meal comparison data available.</p>
            <p className="text-[11px]">Record GutPatch sessions linked to meals to view gastrocolic motility response curves.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-2 px-4 py-2 rounded-lg bg-teal-japan text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Record Meal Session
            </button>
          </div>
        ) : (
          <div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                  <XAxis dataKey="name" stroke="#687985" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#687985" tick={{ fontSize: 10 }} tickLine={false} unit=" ev/m" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const preVal = Number(payload[0]?.value || 0);
                        const postVal = Number(payload[1]?.value || 0);
                        const delta = parseFloat((postVal - preVal).toFixed(1));
                        const pct = preVal > 0 ? Math.round(((postVal - preVal) / preVal) * 100) : 0;
                        return (
                          <div className="bg-surface p-3 rounded-xl border border-border-soft shadow-md text-xs space-y-1">
                            <p className="font-bold text-navy-deep">{label}</p>
                            <div className="flex items-center justify-between gap-4 text-slate-muted">
                              <span>Pre-Meal Baseline:</span>
                              <strong className="text-navy-deep">{preVal} ev/min</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-teal-japan">
                              <span>Postprandial Motility:</span>
                              <strong>{postVal} ev/min</strong>
                            </div>
                            <div className="pt-1.5 mt-1 border-t border-border-soft flex items-center justify-between gap-4 text-forest-green font-medium">
                              <span>Gastrocolic Delta:</span>
                              <strong>+{delta} ev/min (+{pct}%)</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value) => <span className="text-navy-deep font-medium">{value}</span>}
                  />
                  <Bar
                    dataKey="preMeal"
                    name="Pre-Meal Baseline (ev/min)"
                    fill="#103B35"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="postMeal"
                    name="Post-Meal Motility (ev/min)"
                    fill="#176B5B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3.5 p-3.5 rounded-lg bg-bg-ivory border border-border-soft text-xs text-navy-deep flex items-start gap-2.5">
              <Sparkles size={16} className="text-teal-japan flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p className="text-navy-deep">
                  <strong>Calculated Motility Observation:</strong> {dynamicClinicalSummary.text}
                </p>
                <p className="text-[10px] text-slate-muted">
                  Note: Acoustic sound counts reflect simulated bio-acoustic envelope filtering under MEDAITHON research protocol. Not an absolute transit velocity diagnostic.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GutPatchMonitoring;
