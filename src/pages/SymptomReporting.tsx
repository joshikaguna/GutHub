// src/pages/SymptomReporting.tsx
import React, { useState, useMemo } from "react";
import Card from "../components/Card";
import {
  Heart,
  Clock,
  Trash2,
  Smile,
  Frown,
  CheckCircle2,
  Filter,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Symptom, Meal } from "../types";
import { storage } from "../services/storage";

const SYMPTOM_PRESETS = [
  { name: "Bloating", desc: "Abdominal distension or feeling excessively full" },
  { name: "Abdominal pain", desc: "Localized or generalized stomach pain" },
  { name: "Cramps", desc: "Intermittent spasms or muscular colic sensations" },
  { name: "Nausea", desc: "Uneasiness of stomach with inclination to vomit" },
  { name: "Vomiting", desc: "Episodes of stomach evacuation" },
  { name: "Heartburn", desc: "Acid reflux or burning sensation in chest/esophagus" },
  { name: "Constipation-related", desc: "Difficulty, straining, or incomplete evacuation" },
  { name: "Diarrhea-related", desc: "Loose, frequent, or watery bowel urgency" },
];

type DateRange = "7d" | "14d" | "30d" | "all";

const SymptomReporting: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>(() =>
    storage.get<Symptom[]>("symptoms", [])
  );
  const [meals] = useState<Meal[]>(() => storage.get<Meal[]>("meals", []));

  // Form State
  const [selectedType, setSelectedType] = useState<string>("Bloating");
  const [severity, setSeverity] = useState<number>(4);
  const [notes, setNotes] = useState<string>("");
  const [associatedMeal, setAssociatedMeal] = useState<string>("");
  const [reportedTime, setReportedTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Graph Filtering State
  const [graphRange, setGraphRange] = useState<DateRange>("14d");
  const [graphFilterType, setGraphFilterType] = useState<string>("all");
  const [selectedDataPoint, setSelectedDataPoint] = useState<Symptom | null>(null);

  const getSeverityBadge = (val: number) => {
    if (val === 0) return { label: "0 - None", color: "text-forest-green bg-teal-light border-teal-japan/20" };
    if (val <= 3) return { label: `${val} - Mild Discomfort`, color: "text-forest-green bg-[#EBF7F2] border-[#C3E8DC]" };
    if (val <= 6) return { label: `${val} - Moderate Distension`, color: "text-amber-muted bg-[#FFFDF5] border-amber-muted/30" };
    if (val <= 8) return { label: `${val} - Severe Pain`, color: "text-coral-refined bg-[#FFF5F4] border-coral-refined/30" };
    return { label: `${val} - Very Severe`, color: "text-coral-refined bg-[#FFF0EF] border-coral-refined font-bold" };
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedNotes = associatedMeal
      ? `${notes.trim() ? notes.trim() + " " : ""}(Associated with: ${associatedMeal})`
      : notes.trim();

    const newEntry: Symptom = {
      id: "sym-" + Date.now(),
      timestamp: new Date().toISOString(),
      type: selectedType,
      severity,
      notes: formattedNotes || undefined,
      associatedMeal: associatedMeal || undefined,
      simulated: true,
    };

    const updated = [newEntry, ...symptoms];
    setSymptoms(updated);
    storage.set("symptoms", updated);

    // Reset fields
    setNotes("");
    setSeverity(4);
    setAssociatedMeal("");
    setSuccessNotice(`Symptom recorded: "${selectedType}" (Severity ${severity}/10).`);
    setTimeout(() => setSuccessNotice(null), 4500);
  };

  const handleDelete = (id: string) => {
    const updated = symptoms.filter((s) => s.id !== id);
    setSymptoms(updated);
    storage.set("symptoms", updated);
    if (selectedDataPoint?.id === id) {
      setSelectedDataPoint(null);
    }
  };

  // Filter symptoms based on range and symptom type
  const { chartData, rawFilteredSymptoms, trendAnalysis } = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    if (graphRange === "7d") cutoff = now - 7 * 24 * 3600 * 1000;
    else if (graphRange === "14d") cutoff = now - 14 * 24 * 3600 * 1000;
    else if (graphRange === "30d") cutoff = now - 30 * 24 * 3600 * 1000;

    // Filter by date range
    let inRange = symptoms.filter((s) => new Date(s.timestamp).getTime() >= cutoff);

    // Filter by type if specific type selected
    let matchingSymptoms = inRange;
    if (graphFilterType !== "all") {
      matchingSymptoms = inRange.filter((s) => s.type === graphFilterType);
    }

    // Sort chronologically ascending for chart
    const sorted = [...matchingSymptoms].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Build chart data
    const chart = sorted.map((s) => {
      const d = new Date(s.timestamp);
      return {
        id: s.id,
        dateFormatted: d.toLocaleDateString([], { month: "short", day: "numeric" }),
        timeFormatted: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fullDate: `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        type: s.type,
        severity: s.severity,
        notes: s.notes || "No notes recorded",
        raw: s,
      };
    });

    // Trend Analysis Calculation
    // 1. Current severity & Previous severity
    const currentSeverity = sorted.length > 0 ? sorted[sorted.length - 1].severity : null;
    const previousSeverity = sorted.length > 1 ? sorted[sorted.length - 2].severity : null;
    const severityDelta =
      currentSeverity !== null && previousSeverity !== null
        ? currentSeverity - previousSeverity
        : null;

    // 2. Trend Classification
    // Compare average of recent half vs older half
    let trendStatus: "Improving" | "Worsening" | "Stable" | "Insufficient data" = "Insufficient data";
    let trendDetail = "Not enough entries available to identify a meaningful pattern.";

    if (sorted.length >= 2) {
      const mid = Math.floor(sorted.length / 2);
      const olderHalf = sorted.slice(0, mid);
      const recentHalf = sorted.slice(mid);

      const olderAvg = olderHalf.reduce((sum, s) => sum + s.severity, 0) / olderHalf.length;
      const recentAvg = recentHalf.reduce((sum, s) => sum + s.severity, 0) / recentHalf.length;
      const diff = recentAvg - olderAvg;

      if (diff <= -0.7) {
        trendStatus = "Improving";
        trendDetail = `Recent symptom severity decreased by ${Math.abs(diff).toFixed(1)} points on average compared to earlier in this period.`;
      } else if (diff >= 0.7) {
        trendStatus = "Worsening";
        trendDetail = `Recent symptom severity increased by ${diff.toFixed(1)} points on average. Consider reviewing recent dietary triggers.`;
      } else {
        trendStatus = "Stable";
        trendDetail = `Symptom severity has remained consistent (average ~${recentAvg.toFixed(1)}/10) over this period.`;
      }
    }

    // 3. Low-severity or symptom-free days (severity <= 2)
    const lowSeverityCount = sorted.filter((s) => s.severity <= 2).length;

    // 4. Most frequently recorded symptom
    const freqMap: Record<string, number> = {};
    inRange.forEach((s) => {
      freqMap[s.type] = (freqMap[s.type] || 0) + 1;
    });
    let mostFrequent = "None";
    let maxCount = 0;
    Object.entries(freqMap).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = type;
      }
    });

    return {
      chartData: chart,
      rawFilteredSymptoms: sorted,
      trendAnalysis: {
        trendStatus,
        trendDetail,
        currentSeverity,
        previousSeverity,
        severityDelta,
        lowSeverityCount,
        mostFrequent,
        totalEntries: sorted.length,
      },
    };
  }, [symptoms, graphRange, graphFilterType]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Health Tracking
            </span>
            <span className="text-xs text-slate-muted">Digestive Discomfort Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Symptom Journal & Progress Intelligence
          </h1>
          <p className="text-xs text-slate-muted">
            Track severity trajectories, correlate with meals, and evaluate longitudinal stability
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="bg-[#EBF7F2] border border-[#C3E8DC] p-3.5 rounded-xl text-xs text-navy-deep flex items-center gap-2.5 transition-all shadow-xs">
          <CheckCircle2 size={16} className="text-forest-green flex-shrink-0" />
          <span className="font-semibold">{successNotice}</span>
        </div>
      )}

      {/* 1. INTERACTIVE SYMPTOM PROGRESS DASHBOARD */}
      <Card
        title="Interactive Symptom Progress Graph"
        subtitle="Visualizing digestive sensation severity (1–10) over time"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by symptom type */}
            <select
              value={graphFilterType}
              onChange={(e) => setGraphFilterType(e.target.value)}
              className="rounded-lg border border-border-soft px-2.5 py-1 bg-surface text-xs text-navy-deep font-medium focus:outline-none"
            >
              <option value="all">All Symptoms</option>
              {SYMPTOM_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Date Range Selector */}
            <div className="inline-flex rounded-lg border border-border-soft p-0.5 bg-bg-ivory text-xs">
              {(["7d", "14d", "30d", "all"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setGraphRange(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    graphRange === r
                      ? "bg-surface text-navy-deep font-semibold shadow-xs"
                      : "text-slate-muted hover:text-navy-deep"
                  }`}
                >
                  {r === "7d" ? "7 Days" : r === "14d" ? "14 Days" : r === "30d" ? "30 Days" : "All Records"}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Smart Trend Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Trend Indicator */}
            <div className="p-3.5 rounded-xl bg-bg-ivory border border-border-soft flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  trendAnalysis.trendStatus === "Improving"
                    ? "bg-[#EBF7F2] text-forest-green"
                    : trendAnalysis.trendStatus === "Worsening"
                    ? "bg-[#FFF0EF] text-coral-refined"
                    : trendAnalysis.trendStatus === "Stable"
                    ? "bg-teal-light text-teal-japan"
                    : "bg-mist-blue text-slate-muted"
                }`}
              >
                {trendAnalysis.trendStatus === "Improving" ? (
                  <TrendingDown size={18} />
                ) : trendAnalysis.trendStatus === "Worsening" ? (
                  <TrendingUp size={18} />
                ) : trendAnalysis.trendStatus === "Stable" ? (
                  <Minus size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-slate-muted tracking-wider">
                  Progress Trend
                </span>
                <div
                  className={`text-sm font-bold capitalize mt-0.5 ${
                    trendAnalysis.trendStatus === "Improving"
                      ? "text-forest-green"
                      : trendAnalysis.trendStatus === "Worsening"
                      ? "text-coral-refined"
                      : trendAnalysis.trendStatus === "Stable"
                      ? "text-teal-japan"
                      : "text-slate-muted"
                  }`}
                >
                  {trendAnalysis.trendStatus}
                </div>
                <p className="text-[10.5px] text-slate-muted truncate mt-0.5">
                  {trendAnalysis.trendDetail}
                </p>
              </div>
            </div>

            {/* Severity Delta */}
            <div className="p-3.5 rounded-xl bg-surface border border-border-soft">
              <span className="text-[10px] uppercase font-semibold text-slate-muted tracking-wider">
                Current vs Previous
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-bold text-navy-deep font-display">
                  {trendAnalysis.currentSeverity !== null ? `${trendAnalysis.currentSeverity}/10` : "—"}
                </span>
                {trendAnalysis.previousSeverity !== null && (
                  <span className="text-xs text-slate-muted">
                    prev {trendAnalysis.previousSeverity}/10
                  </span>
                )}
              </div>
              <div className="text-[10.5px] mt-0.5">
                {trendAnalysis.severityDelta !== null ? (
                  trendAnalysis.severityDelta < 0 ? (
                    <span className="text-forest-green font-semibold">
                      ↓ {Math.abs(trendAnalysis.severityDelta)} point improvement
                    </span>
                  ) : trendAnalysis.severityDelta > 0 ? (
                    <span className="text-coral-refined font-semibold">
                      ↑ {trendAnalysis.severityDelta} point increase
                    </span>
                  ) : (
                    <span className="text-teal-japan font-semibold">No change (0 delta)</span>
                  )
                ) : (
                  <span className="text-slate-muted">Single entry on file</span>
                )}
              </div>
            </div>

            {/* Low-Severity Days */}
            <div className="p-3.5 rounded-xl bg-surface border border-border-soft">
              <span className="text-[10px] uppercase font-semibold text-slate-muted tracking-wider">
                Mild / Low Discomfort
              </span>
              <div className="text-lg font-bold text-forest-green font-display mt-0.5">
                {trendAnalysis.lowSeverityCount}{" "}
                <span className="text-xs font-normal text-slate-muted">
                  / {trendAnalysis.totalEntries} entries
                </span>
              </div>
              <p className="text-[10.5px] text-slate-muted mt-0.5">
                Logged at severity ≤ 2/10
              </p>
            </div>

            {/* Most Frequent Symptom */}
            <div className="p-3.5 rounded-xl bg-surface border border-border-soft">
              <span className="text-[10px] uppercase font-semibold text-slate-muted tracking-wider">
                Predominant Sensation
              </span>
              <div className="text-sm font-bold text-navy-deep truncate mt-0.5">
                {trendAnalysis.mostFrequent}
              </div>
              <p className="text-[10.5px] text-slate-muted mt-0.5">
                Most frequent in selected window
              </p>
            </div>
          </div>

          {/* Interactive Recharts Line Graph */}
          {chartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-muted space-y-2">
              <Heart size={32} className="mx-auto text-slate-muted/40" />
              <p className="font-semibold text-navy-deep">No symptom records match this filter.</p>
              <p className="text-[11px]">
                Adjust the date range or symptom filter above, or log a new symptom below.
              </p>
            </div>
          ) : (
            <div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        setSelectedDataPoint(data.activePayload[0].payload.raw);
                      }
                    }}
                    margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E8E7" vertical={false} />
                    <XAxis
                      dataKey="dateFormatted"
                      stroke="#687985"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      stroke="#687985"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      label={{
                        value: "Severity (0-10)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 10,
                        fill: "#687985",
                        offset: 20,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-surface p-3 rounded-xl border border-border-soft shadow-md text-xs space-y-1 z-30">
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-bold text-navy-deep">{item.type}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    getSeverityBadge(item.severity).color
                                  }`}
                                >
                                  Severity {item.severity}/10
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-muted flex items-center gap-1">
                                <Calendar size={11} /> {item.fullDate}
                              </div>
                              {item.notes && item.notes !== "No notes recorded" && (
                                <p className="text-[11px] text-navy-deep/80 italic mt-1 pt-1 border-t border-border-soft/60">
                                  "{item.notes}"
                                </p>
                              )}
                              <p className="text-[9px] text-teal-japan font-medium pt-0.5">
                                Click node to inspect details
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={3} stroke="#176B5B" strokeDasharray="4 4" label={{ value: "Mild threshold (≤3)", fill: "#176B5B", fontSize: 9 }} />
                    <ReferenceLine y={7} stroke="#E87575" strokeDasharray="4 4" label={{ value: "High severity (≥7)", fill: "#E87575", fontSize: 9 }} />
                    <Line
                      type="monotone"
                      dataKey="severity"
                      stroke="#176B5B"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "#FFFFFF", stroke: "#176B5B", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#176B5B", stroke: "#68DCC0", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Data Point Inspection Drawer/Card */}
              {selectedDataPoint && (
                <div className="mt-3 p-3.5 rounded-xl bg-teal-light/40 border border-teal-japan/30 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-teal-japan" />
                      <strong className="text-navy-deep">Selected Record Detail:</strong>
                      <span className="font-semibold text-teal-japan">{selectedDataPoint.type}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          getSeverityBadge(selectedDataPoint.severity).color
                        }`}
                      >
                        {selectedDataPoint.severity}/10
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-muted">
                      Recorded on {new Date(selectedDataPoint.timestamp).toLocaleString()}
                      {selectedDataPoint.associatedMeal && ` • Associated with ${selectedDataPoint.associatedMeal}`}
                    </div>
                    {selectedDataPoint.notes && (
                      <p className="text-[11.5px] text-navy-deep italic bg-surface p-2 rounded-lg border border-border-soft/60 mt-1">
                        "{selectedDataPoint.notes}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDataPoint(null)}
                    className="text-slate-muted hover:text-navy-deep text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Explanatory Clinical Non-Diagnostic Legend */}
              <div className="mt-2 text-[10.5px] text-slate-muted flex items-center justify-between">
                <span>
                  <strong>Clinical Note:</strong> Green dashed line represents mild threshold (≤3); red dashed line flags severe discomfort (≥7).
                </span>
                <span className="italic">Non-diagnostic patient self-reporting</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 2. LOGGING FORM & JOURNAL LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Record New Symptom"
            subtitle="Choose category, rate severity on 0–10 scale, and link context"
          >
            <form onSubmit={handleSaveReport} className="space-y-5">
              {/* Category Grid */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-2">
                  1. Symptom Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SYMPTOM_PRESETS.map((preset) => {
                    const isSelected = selectedType === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedType(preset.name)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? "bg-teal-light text-teal-dark border-teal-japan/50 font-semibold shadow-xs"
                            : "bg-surface hover:bg-bg-ivory text-navy-deep border-border-soft"
                        }`}
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-[10.5px] text-slate-muted mt-0.5 line-clamp-1">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Slider (0 - 10) */}
              <div className="p-4 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                    2. Severity Rating (0 - 10) *
                  </label>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      getSeverityBadge(severity).color
                    }`}
                  >
                    {getSeverityBadge(severity).label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Smile size={16} className="text-forest-green flex-shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full accent-teal-japan h-1.5 bg-[#D5DFDC] rounded-lg appearance-none cursor-pointer"
                  />
                  <Frown size={16} className="text-coral-refined flex-shrink-0" />
                </div>

                <div className="flex justify-between text-[10px] text-slate-muted px-1 font-medium">
                  <span>0 (None)</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10 (Worst)</span>
                </div>
              </div>

              {/* Time & Associated Meal Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    3. Time of Occurrence *
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-muted" />
                    <input
                      type="time"
                      value={reportedTime}
                      onChange={(e) => setReportedTime(e.target.value)}
                      className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs font-medium text-navy-deep focus:outline-none focus:border-teal-japan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Associated Meal / Trigger (Optional)
                  </label>
                  <select
                    value={associatedMeal}
                    onChange={(e) => setAssociatedMeal(e.target.value)}
                    className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs font-medium text-navy-deep focus:outline-none focus:border-teal-japan"
                  >
                    <option value="">None / Independent</option>
                    {meals.map((m) => (
                      <option key={m.id} value={`${m.type} @ ${m.time}`}>
                        {m.type} @ {m.time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  4. Patient Notes / Context
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild lower left abdomen fullness after sitting at desk; improved with hydration..."
                  rows={2}
                  className="w-full rounded-lg border border-border-soft p-2.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan placeholder:text-slate-muted/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white font-medium text-xs tracking-wider transition-colors shadow-xs"
              >
                Save Symptom Entry
              </button>
            </form>
          </Card>
        </div>

        {/* Symptoms History List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Recent Journal Entries"
            subtitle={`${symptoms.length} record(s) on file`}
          >
            {symptoms.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-muted space-y-1">
                <Heart size={24} className="mx-auto text-slate-muted/40 mb-2" />
                <p>No symptom records in journal.</p>
                <p className="text-[11px]">Use the form to log sensations.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {symptoms.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-bg-ivory/80 border border-border-soft text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-navy-deep">{item.type}</span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                              getSeverityBadge(item.severity).color
                            }`}
                          >
                            Sev {item.severity}/10
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-muted mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(item.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          •{" "}
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-muted/50 hover:text-coral-refined p-1 rounded transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {item.notes && (
                      <p className="p-2 rounded bg-surface border border-border-soft/60 text-[11px] text-navy-deep italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SymptomReporting;
