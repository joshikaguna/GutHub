// src/pages/DoctorSummarySheet.tsx
import React, { useState, useMemo } from "react";
import Card from "../components/Card";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Heart,
  Pill,
  Radio,
  Utensils,
  ShieldCheck,
  ArrowLeft,
  Info,
  Scale,
  Flame,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { storage, INITIAL_PROFILE } from "../services/storage";
import {
  Measurement,
  Symptom,
  Medication,
  Meal,
  BowelEvent,
  GutPatchSession,
  PersonalInsight,
  PatientProfile,
} from "../types";
import { calculatePersonalizedTargets } from "../services/nutritionDb";

const DoctorSummarySheet: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const profile = storage.get<PatientProfile>("patient_profile", INITIAL_PROFILE);
  const targets = useMemo(() => calculatePersonalizedTargets(profile), [profile]);

  const symptoms = storage.get<Symptom[]>("symptoms", []);
  const medications = storage.get<Medication[]>("medications", []);
  const meals = storage.get<Meal[]>("meals", []);
  const bowels = storage.get<BowelEvent[]>("bowel", []);
  const sessions = storage.get<GutPatchSession[]>("gpatch", []);
  const insights = storage.get<PersonalInsight[]>("insights", []);
  const measurement = storage.get<Measurement>("measure", {
    timestamp: new Date().toISOString(),
    heartRate: 74,
    skinTemp: 36.6,
    eda: 2.4,
    activity: "Rest",
    smartBandConnected: true,
    gutPatchConnected: true,
    signalQuality: "Optimal",
    movementArtifact: false,
  });

  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === "taken").length;
  const adherencePercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  const avgSeverity =
    symptoms.length > 0
      ? (symptoms.reduce((acc, s) => acc + s.severity, 0) / symptoms.length).toFixed(1)
      : "0";

  // Trend analysis calculation for report
  const sortedSymptoms = useMemo(() => {
    return [...symptoms].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [symptoms]);

  const symptomTrend = useMemo(() => {
    if (sortedSymptoms.length < 2) return "Insufficient data";
    const mid = Math.floor(sortedSymptoms.length / 2);
    const older = sortedSymptoms.slice(0, mid);
    const recent = sortedSymptoms.slice(mid);
    const oldAvg = older.reduce((s, i) => s + i.severity, 0) / older.length;
    const recAvg = recent.reduce((s, i) => s + i.severity, 0) / recent.length;
    const diff = recAvg - oldAvg;
    if (diff <= -0.7) return "Improving (Severity Decreasing)";
    if (diff >= 0.7) return "Worsening (Severity Increasing)";
    return "Stable (Consistent Longitudinal Range)";
  }, [sortedSymptoms]);

  // Total nutrition logged today
  const totalCaloriesLogged = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const totalProteinLogged = meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      patient: {
        name: profile.fullName,
        id: "GH-4091",
        age: profile.age,
        sex: profile.sex,
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        activityLevel: profile.activityLevel,
        dietaryRestrictions: profile.dietaryRestrictions,
        basalBMR: `${targets.bmr} kcal`,
        targetTDEE: `${targets.targetCalories} kcal`,
        targetProtein: `${targets.targetProteinGrams} g`,
        protocol: "MEDAITHON '26 Digestive Transit & Adherence Monitoring",
        generatedAt: new Date().toISOString(),
      },
      adherenceRate: `${adherencePercent}%`,
      averageSymptomSeverity: `${avgSeverity}/10`,
      symptomTrend,
      medications,
      symptoms,
      meals,
      bowelEvents: bowels,
      gutPatchSessions: sessions,
      insights,
      vitalsSnapshot: measurement,
      disclaimer:
        "Demonstration data generated for MEDAITHON '26. Non-invasive sensor trends are exploratory and not for diagnostic or prescriptive use.",
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GutHub_Clinical_Report_${profile.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/patient"
              className="text-xs text-slate-muted hover:text-navy-deep flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <span className="text-border-soft">•</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-light text-teal-dark border border-teal-japan/20">
              Print-Ready Clinical Document
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Doctor Clinical Summary Sheet
          </h1>
          <p className="text-xs text-slate-muted">
            Structured consultation document for gastroenterologist review and patient health records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-bg-ivory text-navy-deep text-xs font-medium border border-border-soft transition-colors"
          >
            <Download size={13} /> Download Raw JSON
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Printer size={13} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-[#EBF7F2] border border-[#C3E8DC] p-3 rounded-lg text-xs text-navy-deep flex items-center gap-2 print:hidden">
          <CheckCircle2 size={15} className="text-forest-green flex-shrink-0" />
          <span>Clinical data package downloaded successfully.</span>
        </div>
      )}

      {/* Main Printable Clinical Review Document */}
      <div className="bg-surface rounded-xl border border-border-soft shadow-subtle p-6 sm:p-10 space-y-7 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-border-soft pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <img
                src="/guthub-logo.jpg"
                alt="GutHub Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white border border-border-soft p-0.5 shadow-xs"
              />
              <h2 className="text-lg sm:text-xl font-bold text-navy-deep font-display tracking-tight">
                GutHub Clinical Telemetry Summary
              </h2>
            </div>
            <p className="text-xs text-slate-muted">
              Sensor-Based Digestive Transit, Nutrition Adherence & Stool Form Surveillance Report
            </p>
            <p className="text-[10.5px] text-slate-muted mt-1">
              Platform: MEDAITHON '26 Research Prototype • Generated: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-muted">
            <p>
              <strong>Patient Name:</strong> {profile.fullName}
            </p>
            <p>
              <strong>Identifier:</strong> #GH-4091 (Age: {profile.age} • {profile.sex})
            </p>
            <p>
              <strong>Physical Baseline:</strong> {profile.weightKg} kg • {profile.heightCm} cm • {profile.activityLevel}
            </p>
            <p>
              <strong>Dietary Tags:</strong> {profile.dietaryRestrictions.join(", ") || "None"}
            </p>
            <p>
              <strong>Hardware:</strong> GutPatch BLE + Smart Medication Box + SmartBand
            </p>
          </div>
        </div>

        {/* Executive Metrics Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted block">
              Medication Adherence
            </span>
            <div className="text-xl font-bold text-forest-green mt-0.5 font-display">{adherencePercent}%</div>
            <p className="text-[10.5px] text-slate-muted mt-0.5">
              {takenMeds} of {totalMeds} doses verified
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted block">
              Gut Acoustic Peak
            </span>
            <div className="text-xl font-bold text-teal-japan mt-0.5 font-display">
              {sessions[0]?.acousticEventRate || 14.2}
            </div>
            <p className="text-[10.5px] text-slate-muted mt-0.5">events/min (postprandial)</p>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted block">
              Symptom Trend Status
            </span>
            <div className="text-xs font-bold text-navy-deep mt-1 font-display truncate">
              {symptomTrend}
            </div>
            <p className="text-[10.5px] text-slate-muted mt-0.5">
              Avg severity: {avgSeverity}/10 ({symptoms.length} logs)
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted block">
              Nutrition & Energy
            </span>
            <div className="text-lg font-bold text-navy-deep mt-0.5 font-display">
              {totalCaloriesLogged} / {targets.targetCalories} <span className="text-xs font-normal">kcal</span>
            </div>
            <p className="text-[10.5px] text-slate-muted mt-0.5">
              Protein: {totalProteinLogged}g / {targets.targetProteinGrams}g
            </p>
          </div>
        </div>

        {/* Section 1: GutPatch Bio-Acoustic Motility Sessions (Breakfast, Lunch, Dinner) */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border-soft pb-1.5">
            <Radio size={14} className="text-teal-japan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-deep">
              1. GutPatch Bio-Acoustic Peristalsis & Motility Summary (All Meals)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-soft text-slate-muted font-medium bg-bg-ivory/60">
                  <th className="py-2 px-3">Meal Category</th>
                  <th className="py-2 px-3">Time Window</th>
                  <th className="py-2 px-3">Acoustic Rate</th>
                  <th className="py-2 px-3">Pre → Postprandial</th>
                  <th className="py-2 px-3">Signal Quality</th>
                  <th className="py-2 px-3">Clinical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-bg-ivory/40">
                    <td className="py-2 px-3 font-semibold text-navy-deep">
                      {session.associatedMeal || session.sessionName} ({session.timePeriod || "Window"})
                    </td>
                    <td className="py-2 px-3 text-slate-muted">
                      {session.startTime} {session.endTime ? `– ${session.endTime}` : "(Active)"}
                    </td>
                    <td className="py-2 px-3 font-bold text-navy-deep">
                      {session.acousticEventRate} events/min
                    </td>
                    <td className="py-2 px-3 text-teal-japan font-medium">
                      {session.preMealAcousticRate}/min → {session.postMealAcousticRate}/min
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.2 rounded bg-teal-light text-teal-dark text-[10px] font-medium border border-teal-japan/20">
                        {session.signalQuality}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-muted text-[11px]">
                      {session.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Prescription Adherence Ledger */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border-soft pb-1.5">
            <Pill size={14} className="text-forest-green" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-deep">
              2. Medication Ingestion & Smart Medication Box Verification
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-soft text-slate-muted font-medium bg-bg-ivory/60">
                  <th className="py-2 px-3">Medication Name</th>
                  <th className="py-2 px-3">Dosage</th>
                  <th className="py-2 px-3">Scheduled</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">SmartBox Verification</th>
                  <th className="py-2 px-3">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {medications.map((med) => {
                  const isTaken = med.status === "taken";
                  return (
                    <tr key={med.id} className="hover:bg-bg-ivory/40">
                      <td className="py-2 px-3 font-semibold text-navy-deep">{med.name}</td>
                      <td className="py-2 px-3 text-slate-muted">{med.dose}</td>
                      <td className="py-2 px-3 text-slate-muted">{med.scheduledTime}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            isTaken
                              ? "bg-[#EBF7F2] text-forest-green border border-[#C3E8DC]"
                              : "bg-bg-ivory text-slate-muted border border-border-soft"
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-navy-deep">
                        {isTaken && med.takenAt ? `Verified at ${med.takenAt}` : "Pending"}
                      </td>
                      <td className="py-2 px-3 text-slate-muted text-[11px]">
                        {med.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Symptom Log & Bristol Stool Form Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Symptoms Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border-soft pb-1">
              <Heart size={14} className="text-coral-refined" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-deep">
                3A. Patient-Reported Symptoms
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {symptoms.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg bg-bg-ivory/60 border border-border-soft text-xs flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy-deep">{s.type}</span>
                      <span
                        className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded ${
                          s.severity >= 5
                            ? "bg-coral-refined/10 text-coral-refined"
                            : "bg-teal-light text-teal-dark"
                        }`}
                      >
                        Severity: {s.severity}/10
                      </span>
                    </div>
                    {s.notes && (
                      <p className="text-[11px] text-slate-muted mt-0.5 italic">"{s.notes}"</p>
                    )}
                  </div>
                  <span className="text-[10.5px] text-slate-muted">
                    {new Date(s.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    {new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bowel Events Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border-soft pb-1">
              <Utensils size={14} className="text-teal-japan" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-deep">
                3B. Bowel Evacuations (Bristol Scale)
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {bowels.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg bg-bg-ivory/60 border border-border-soft text-xs flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy-deep">
                        Bristol Type {b.stoolForm}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-surface border border-border-soft text-slate-muted">
                        {b.urgency} Urgency
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-muted mt-0.5">{b.stoolDescription}</p>
                  </div>
                  <span className="text-[10.5px] text-slate-muted">@{b.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Explainable Algorithmic Observations */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border-soft pb-1.5">
            <ShieldCheck size={14} className="text-teal-japan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-deep">
              4. Sensor-Derived Exploratory Observations for Physician Review
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-lg bg-bg-ivory/60 border border-border-soft text-xs space-y-1"
              >
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-teal-japan">
                  {ins.category}
                </span>
                <h4 className="font-semibold text-navy-deep text-xs">{ins.title}</h4>
                <p className="text-[11px] text-slate-muted leading-relaxed">{ins.summary}</p>
                <div className="p-2 rounded bg-surface border border-border-soft text-[10px] text-slate-muted">
                  <strong>Telemetry Basis:</strong> {ins.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5 & 6: Data Limitations, Attestation, and Physician Signature */}
        <div className="pt-5 border-t border-border-soft space-y-3.5 text-xs text-slate-muted">
          <div className="p-3.5 rounded-lg bg-bg-ivory/60 border border-border-soft text-[11px] leading-relaxed space-y-1">
            <strong className="text-navy-deep block font-semibold">
              Clinical & Regulatory Attestation:
            </strong>
            <p>
              This summary report is generated from non-invasive acoustic, photoplethysmography, and container sensors developed for MEDAITHON '26. Physiological patterns presented herein reflect observational motility trends and adherence logs. It does not replace scintigraphy, radiopaque marker transit studies, or clinical endoscopy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] pt-3">
            <span>GutHub Clinical Telemetry Engine v2.0 • Study Protocol #GH-4091</span>
            <div className="border-t sm:border-t-0 sm:border-b border-border-soft pt-2 sm:pt-0 pb-1 sm:w-64">
              <span>Physician Reviewer Signature: __________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSummarySheet;
