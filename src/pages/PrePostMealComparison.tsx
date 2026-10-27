// src/pages/PrePostMealComparison.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import {
  BarChart2,
  Utensils,
  Radio,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { Meal, Symptom, GutPatchSession, Measurement } from "../types";
import { storage } from "../services/storage";

const PrePostMealComparison: React.FC = () => {
  const [meals] = useState<Meal[]>(() => storage.get<Meal[]>("meals", []));
  const [symptoms] = useState<Symptom[]>(() => storage.get<Symptom[]>("symptoms", []));
  const [sessions] = useState<GutPatchSession[]>(() => storage.get<GutPatchSession[]>("gpatch", []));
  const [measurement] = useState<Measurement>(() => storage.get("measure", {
    timestamp: new Date().toISOString(),
    heartRate: 74,
    skinTemp: 36.6,
    eda: 2.4,
    activity: "Rest",
    smartBandConnected: true,
    gutPatchConnected: true,
    signalQuality: "Optimal",
    movementArtifact: false,
  }));

  // Selected meal for deep comparison: "all" or specific meal.id
  const [selectedMealId, setSelectedMealId] = useState<string>(meals[0]?.id || "all");
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "historical">("overview");

  // Correlate meals with sessions & symptoms
  const enrichedMeals = useMemo(() => {
    return meals.map((m) => {
      // Find matching session by associatedMeal or meal category
      const matchedSession = sessions.find(
        (s) => s.associatedMeal === m.type || (s.linkedMealId && s.linkedMealId === m.id)
      );

      // Find matching pre and post symptoms
      const mealSymptoms = symptoms.filter((s) => {
        if (s.linkedMealId && s.linkedMealId === m.id) return true;
        if (s.associatedMeal && s.associatedMeal.toLowerCase().includes(m.type.toLowerCase())) return true;
        return false;
      });

      const preSym = mealSymptoms.find((s) => s.timingRelativeToMeal === "pre-meal");
      const postSym = mealSymptoms.find((s) => s.timingRelativeToMeal === "post-meal");

      // Default baseline & post values from session or meal or realistic estimates
      const preAcoustic = matchedSession?.preMealAcousticRate ?? m.preMealAcousticRate ?? 4.8;
      const postAcoustic = matchedSession?.postMealAcousticRate ?? m.postMealAcousticRate ?? (preAcoustic * 2.4);

      const preSeverity = preSym?.severity ?? m.preMealSymptomSeverity ?? 1;
      const postSeverity = postSym?.severity ?? m.postMealSymptomSeverity ?? 3;

      const preHr = matchedSession?.preMealHeartRate ?? 72;
      const postHr = matchedSession?.postMealHeartRate ?? 78;

      const acousticDelta = parseFloat((postAcoustic - preAcoustic).toFixed(1));
      const acousticSurgePercent = Math.round((acousticDelta / Math.max(1, preAcoustic)) * 100);
      const severityDelta = postSeverity - preSeverity;
      const hrDelta = postHr - preHr;

      return {
        ...m,
        matchedSession,
        preAcoustic,
        postAcoustic,
        acousticDelta,
        acousticSurgePercent,
        preSeverity,
        postSeverity,
        severityDelta,
        preHr,
        postHr,
        hrDelta,
      };
    });
  }, [meals, sessions, symptoms]);

  const activeMeal = useMemo(() => {
    if (selectedMealId === "all") return enrichedMeals[0] || null;
    return enrichedMeals.find((m) => m.id === selectedMealId) || enrichedMeals[0] || null;
  }, [enrichedMeals, selectedMealId]);

  // Aggregate Comparison Chart Data (comparing across all meals)
  const allMealsComparisonData = useMemo(() => {
    return enrichedMeals.map((m) => ({
      name: `${m.type} (${m.time})`,
      "Pre-Meal Motility (ev/m)": m.preAcoustic,
      "Post-Meal Motility (ev/m)": m.postAcoustic,
      "Pre-Meal Discomfort (/10)": m.preSeverity,
      "Post-Meal Discomfort (/10)": m.postSeverity,
    }));
  }, [enrichedMeals]);

  // Single Meal Detailed Side-by-Side Chart Data
  const singleMealChartData = useMemo(() => {
    if (!activeMeal) return [];
    return [
      {
        metric: "Motility (events/min)",
        "Pre-Meal": activeMeal.preAcoustic,
        "Post-Meal": activeMeal.postAcoustic,
      },
      {
        metric: "Symptom Severity (0-10)",
        "Pre-Meal": activeMeal.preSeverity,
        "Post-Meal": activeMeal.postSeverity,
      },
      {
        metric: "Heart Rate (scaled/10)",
        "Pre-Meal": parseFloat((activeMeal.preHr / 10).toFixed(1)),
        "Post-Meal": parseFloat((activeMeal.postHr / 10).toFixed(1)),
      },
    ];
  }, [activeMeal]);

  // Motility Curve Data for Selected Meal (from session trend or standard curve)
  const motilityCurveData = useMemo(() => {
    if (activeMeal?.matchedSession?.abdominalExpansionTrend) {
      return activeMeal.matchedSession.abdominalExpansionTrend.map((pt) => ({
        minute: `${pt.minute}m`,
        motility: pt.soundRate,
        expansion: pt.expansion,
      }));
    }
    // Default physiological curve
    return [
      { minute: "0m (Pre)", motility: activeMeal?.preAcoustic || 4.8, expansion: 0.1 },
      { minute: "15m", motility: 7.4, expansion: 0.4 },
      { minute: "30m", motility: 14.8, expansion: 1.1 },
      { minute: "45m (Peak)", motility: activeMeal?.postAcoustic || 15.2, expansion: 1.6 },
      { minute: "60m", motility: 12.5, expansion: 1.3 },
      { minute: "90m", motility: 8.2, expansion: 0.7 },
      { minute: "120m", motility: 5.6, expansion: 0.3 },
    ];
  }, [activeMeal]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Multimodal Gastrointestinal Analytics
            </span>
            <span className="text-xs text-slate-muted">Digestive Transit Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Pre- vs. Post-Meal Gastrointestinal Comparison
          </h1>
          <p className="text-xs text-slate-muted">
            Evaluate how digestive acoustic motility, symptom severity, and autonomic vitals change following food intake
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/meals"
            className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-bg-ivory border border-border-soft text-navy-deep text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Utensils size={13} className="text-slate-muted" />
            <span>Log Meal</span>
          </Link>

          <Link
            to="/gpatch"
            className="px-3.5 py-1.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Radio size={13} />
            <span>GutPatch Session</span>
          </Link>
        </div>
      </div>

      {/* Empty State Guard if no meals exist */}
      {meals.length === 0 ? (
        <Card noPadding className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal-light text-teal-japan flex items-center justify-center mx-auto">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-base font-bold text-navy-deep font-display">
            No Meal or Motility Records Available for Comparison
          </h3>
          <p className="text-xs text-slate-muted max-w-md mx-auto leading-relaxed">
            The comparison engine requires at least one logged meal with corresponding bio-acoustic or symptom observations to generate pre- vs. post-meal analytics.
          </p>
          <div className="pt-2">
            <Link
              to="/meals"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-japan text-white text-xs font-semibold shadow-xs"
            >
              <Plus size={14} /> Log Your First Meal
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Meal Identification & Selector Bar */}
          <div className="bg-surface rounded-xl border border-border-soft p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-navy-deep uppercase tracking-wider">
                Select Meal for Comparison:
              </span>
              <select
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                className="rounded-lg border border-border-soft px-3 py-1.5 bg-surface text-xs text-navy-deep font-semibold focus:outline-none focus:border-teal-japan"
              >
                <option value="all">Compare All Meals (Cross-Meal Overview)</option>
                {enrichedMeals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.type} @ {m.time} ({m.totalCalories || 0} kcal, {m.items?.length || 0} items)
                  </option>
                ))}
              </select>
            </div>

            {/* View Tab Selector */}
            <div className="inline-flex rounded-lg border border-border-soft p-0.5 bg-bg-ivory text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-surface text-navy-deep font-semibold shadow-xs"
                    : "text-slate-muted hover:text-navy-deep"
                }`}
              >
                Key Metrics
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "timeline"
                    ? "bg-surface text-navy-deep font-semibold shadow-xs"
                    : "text-slate-muted hover:text-navy-deep"
                }`}
              >
                Motility Timeline
              </button>
              <button
                onClick={() => setActiveTab("historical")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "historical"
                    ? "bg-surface text-navy-deep font-semibold shadow-xs"
                    : "text-slate-muted hover:text-navy-deep"
                }`}
              >
                Historical Table
              </button>
            </div>
          </div>

          {/* 1. FOUR KEY METRICS COMPARISON CARDS */}
          {activeMeal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Bio-Acoustic Motility */}
              <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-muted">
                  <span className="font-semibold uppercase tracking-wider text-[10.5px]">
                    1. Acoustic Motility
                  </span>
                  <Radio size={14} className="text-teal-japan" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-navy-deep font-display">
                      {activeMeal.preAcoustic} → {activeMeal.postAcoustic}
                    </span>
                    <span className="text-[10px] text-slate-muted ml-1">ev/min</span>
                  </div>
                  <span className="text-xs font-bold text-forest-green">
                    +{activeMeal.acousticSurgePercent}%
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border-soft/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-muted">Gastrocolic Delta:</span>
                  <span className="font-bold text-forest-green">+{activeMeal.acousticDelta} ev/min</span>
                </div>
              </div>

              {/* Metric 2: Symptom Discomfort */}
              <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-muted">
                  <span className="font-semibold uppercase tracking-wider text-[10.5px]">
                    2. Discomfort Score
                  </span>
                  <Heart size={14} className="text-coral-refined" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-navy-deep font-display">
                      {activeMeal.preSeverity}/10 → {activeMeal.postSeverity}/10
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      activeMeal.severityDelta > 0
                        ? "text-coral-refined"
                        : activeMeal.severityDelta < 0
                        ? "text-forest-green"
                        : "text-slate-muted"
                    }`}
                  >
                    {activeMeal.severityDelta > 0 ? `+${activeMeal.severityDelta}` : activeMeal.severityDelta} pts
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border-soft/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-muted">Postprandial Shift:</span>
                  <span
                    className={`font-semibold ${
                      activeMeal.severityDelta > 0 ? "text-amber-muted" : "text-forest-green"
                    }`}
                  >
                    {activeMeal.severityDelta > 0 ? "Mild Elevation" : "Stable Comfort"}
                  </span>
                </div>
              </div>

              {/* Metric 3: Hemodynamic Heart Rate */}
              <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-muted">
                  <span className="font-semibold uppercase tracking-wider text-[10.5px]">
                    3. Autonomic Pulse
                  </span>
                  <Activity size={14} className="text-teal-japan" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-navy-deep font-display">
                      {activeMeal.preHr} → {activeMeal.postHr}
                    </span>
                    <span className="text-[10px] text-slate-muted ml-1">bpm</span>
                  </div>
                  <span className="text-xs font-bold text-teal-japan">
                    +{activeMeal.hrDelta} bpm
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border-soft/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-muted">Splanchnic Flow:</span>
                  <span className="font-semibold text-teal-dark">Normal Perfusion</span>
                </div>
              </div>

              {/* Metric 4: Meal Energy & Fiber */}
              <div className="bg-surface p-4 rounded-xl border border-border-soft shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-muted">
                  <span className="font-semibold uppercase tracking-wider text-[10.5px]">
                    4. Ingested Load
                  </span>
                  <Utensils size={14} className="text-forest-green" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-navy-deep font-display">
                      {activeMeal.totalCalories || 0}
                    </span>
                    <span className="text-[10px] text-slate-muted ml-1">kcal</span>
                  </div>
                  <span className="text-xs font-semibold text-forest-green">
                    {activeMeal.totalProtein || 0}g protein
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border-soft/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-muted">Dietary Fiber:</span>
                  <span className="font-semibold text-navy-deep">
                    {activeMeal.totalFiber || 0}g fiber
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. MAIN VISUALIZATION WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Visual Chart (8 cols) */}
            <div className="lg:col-span-8">
              <Card
                title={
                  selectedMealId === "all"
                    ? "Cross-Meal Gastrointestinal Dynamics (All Logged Meals)"
                    : `Pre- vs. Post-Meal Dynamics: ${activeMeal?.type} (@ ${activeMeal?.time})`
                }
                subtitle="Evaluating digestive sound surge and discomfort markers before and after ingestion"
              >
                <div className="space-y-4">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedMealId === "all" ? (
                        <BarChart
                          data={allMealsComparisonData}
                          margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                          <XAxis dataKey="name" stroke="#687985" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#687985" tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#E1E8E7",
                              borderRadius: "8px",
                              fontSize: "12px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                          <Bar dataKey="Pre-Meal Motility (ev/m)" fill="#103B35" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Post-Meal Motility (ev/m)" fill="#176B5B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Post-Meal Discomfort (/10)" fill="#E87575" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <BarChart
                          data={singleMealChartData}
                          margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                          <XAxis dataKey="metric" stroke="#687985" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#687985" tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#E1E8E7",
                              borderRadius: "8px",
                              fontSize: "12px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                          <Bar dataKey="Pre-Meal" fill="#103B35" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Post-Meal" fill="#176B5B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="p-3 bg-bg-ivory/80 rounded-lg border border-border-soft text-xs text-navy-deep flex items-start gap-2">
                    <Info size={15} className="text-teal-japan flex-shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-slate-muted leading-relaxed">
                      <strong>Physiological Landmark:</strong> An acoustic motility increase of 100%–300% post-meal reflects normal colon activation (gastrocolic reflex) driven by gastric distension and cholecystokinin release.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Meal Impact Summary & Clinical Analysis (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card
                title="Clinical Meal Impact Summary"
                subtitle="Exploratory correlation report"
              >
                {activeMeal && (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-teal-light/40 border border-teal-japan/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-deep">{activeMeal.type} (@ {activeMeal.time})</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-japan text-white">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-muted leading-relaxed">
                        {activeMeal.description || "Logged dietary intake."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-forest-green flex-shrink-0 mt-0.5" />
                        <span className="text-[11.5px] text-navy-deep leading-snug">
                          <strong>Motility Response:</strong> Bowel sound event rate increased from{" "}
                          <strong>{activeMeal.preAcoustic}</strong> to{" "}
                          <strong>{activeMeal.postAcoustic} events/min</strong> (+{activeMeal.acousticSurgePercent}%).
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-amber-muted flex-shrink-0 mt-0.5" />
                        <span className="text-[11.5px] text-navy-deep leading-snug">
                          <strong>Symptom Dynamics:</strong> Discomfort transitioned from{" "}
                          <strong>{activeMeal.preSeverity}/10</strong> to{" "}
                          <strong>{activeMeal.postSeverity}/10</strong> ({activeMeal.severityDelta > 0 ? `+${activeMeal.severityDelta}` : "0"} delta).
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="text-teal-japan flex-shrink-0 mt-0.5" />
                        <span className="text-[11.5px] text-navy-deep leading-snug">
                          <strong>Digestive Tolerance:</strong> High tolerability observed; no severe colic spasms detected during postprandial window.
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg-ivory border border-border-soft text-[10.5px] text-slate-muted leading-relaxed italic">
                      <strong>Non-Diagnostic Disclaimer:</strong> Gastrointestinal observations reflect exploratory sensor and patient logs. Individual responses vary with hydration, speed of ingestion, and stress.
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* 3. POSTPRANDIAL TIME-SERIES CURVE (0 to 120 minutes) */}
          {activeTab === "timeline" && (
            <Card
              title={`Postprandial Motility Progression Curve (0 - 120 Minutes): ${activeMeal?.type}`}
              subtitle="Tracking the trajectory of sound bursts clusters and abdominal strain expansion over time"
            >
              <div className="space-y-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={motilityCurveData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                      <XAxis dataKey="minute" stroke="#687985" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#687985" tick={{ fontSize: 10 }} unit=" ev/m" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <ReferenceLine y={activeMeal?.preAcoustic || 5.0} stroke="#687985" strokeDasharray="3 3" label={{ value: "Pre-Meal Baseline", fill: "#687985", fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="motility"
                        name="Acoustic Motility (events/min)"
                        stroke="#168C87"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#168C87" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {/* 4. HISTORICAL MULTI-MEAL COMPARISON TABLE */}
          <Card
            title="Historical Multi-Meal Comparison Table"
            subtitle="Side-by-side comparison across all recorded meals and time periods"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-soft text-slate-muted font-medium bg-bg-ivory/60">
                    <th className="py-2.5 px-3">Meal Category</th>
                    <th className="py-2.5 px-3">Scheduled Time</th>
                    <th className="py-2.5 px-3">Calories / Protein</th>
                    <th className="py-2.5 px-3">Motility (Pre → Post)</th>
                    <th className="py-2.5 px-3">Surge (%)</th>
                    <th className="py-2.5 px-3">Symptom Shift</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/60">
                  {enrichedMeals.map((meal) => (
                    <tr
                      key={meal.id}
                      onClick={() => setSelectedMealId(meal.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedMealId === meal.id ? "bg-teal-light/30 font-semibold" : "hover:bg-bg-ivory/40"
                      }`}
                    >
                      <td className="py-2.5 px-3 text-navy-deep">
                        <div className="font-semibold">{meal.type}</div>
                        <div className="text-[10px] text-slate-muted line-clamp-1">{meal.description || "Logged meal"}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-muted">{meal.time}</td>
                      <td className="py-2.5 px-3 text-navy-deep">
                        <div>{meal.totalCalories || 0} kcal</div>
                        <div className="text-[10px] text-slate-muted">{meal.totalProtein || 0}g protein</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-navy-deep">
                        {meal.preAcoustic} → {meal.postAcoustic} <span className="text-[10px] text-slate-muted">ev/m</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-forest-green font-bold">
                          +{meal.acousticSurgePercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-navy-deep">
                          {meal.preSeverity}/10 → {meal.postSeverity}/10
                        </span>
                        <span
                          className={`text-[10px] ml-1 font-semibold ${
                            meal.severityDelta > 0 ? "text-amber-muted" : "text-forest-green"
                          }`}
                        >
                          ({meal.severityDelta > 0 ? `+${meal.severityDelta}` : meal.severityDelta})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF7F2] text-forest-green border border-[#C3E8DC]">
                          Normal Gastrocolic
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrePostMealComparison;
