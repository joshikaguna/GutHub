// src/pages/PersonalInsights.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import {
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  Lightbulb,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { PersonalInsight } from "../types";
import { storage } from "../services/storage";

const PersonalInsights: React.FC = () => {
  const [insights] = useState<PersonalInsight[]>(() =>
    storage.get<PersonalInsight[]>("insights", [])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Intelligence
            </span>
            <span className="text-xs text-slate-muted">Explainable Pattern Discovery</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-navy-deep font-display">
            Personal Digestive Health Insights
          </h1>
          <p className="text-xs text-slate-muted">
            Hypothesis-generating observations derived by correlating meal timing, bio-acoustic motility surges, and medication logs
          </p>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Notice */}
      <div className="bg-surface border border-amber-muted/40 p-4 rounded-xl shadow-subtle text-xs text-navy-deep flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-muted flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-semibold text-navy-deep">
            Exploratory Demonstration Disclaimer:
          </strong>
          <p className="text-slate-muted leading-relaxed text-[11.5px]">
            The observations below are algorithmic correlations produced for MEDAITHON '26 exploration. They do not constitute clinical diagnoses, therapeutic prescriptions, or direct measurements of gastrointestinal transit velocity.
          </p>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            title={
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-teal-japan flex-shrink-0" />
                <span className="text-sm font-bold text-navy-deep">{insight.title}</span>
              </div>
            }
            badge={
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-mist-blue text-navy-deep border border-border-soft">
                {insight.confidence}
              </span>
            }
          >
            <div className="space-y-3 mt-1 text-xs">
              <span className="text-[10.5px] font-semibold text-teal-japan uppercase tracking-wider block">
                Category: {insight.category}
              </span>

              <p className="text-navy-deep leading-relaxed text-xs font-medium">
                {insight.summary}
              </p>

              {/* Underlying Sensor Evidence Box */}
              <div className="p-3 rounded-lg bg-bg-ivory/80 border border-border-soft text-[11px] text-slate-muted space-y-1">
                <strong className="text-[10px] uppercase tracking-wider text-navy-deep block font-semibold">
                  Sensor Evidence & Telemetry Basis:
                </strong>
                <p className="leading-relaxed">{insight.evidence}</p>
              </div>

              {/* Review Status & Limitations */}
              <div className="pt-2 border-t border-border-soft/60 flex items-center justify-between text-[10.5px] text-slate-muted">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {insight.timestamp}
                </span>
                <span className="flex items-center gap-1 text-forest-green font-medium">
                  <FileCheck2 size={12} /> Pending Clinician Review
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Explanatory Framework Box */}
      <Card
        title="Explainable Observation Methodology"
        subtitle="Transparent algorithmic logic connecting multimodal data streams"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-muted">
          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft space-y-1">
            <strong className="text-navy-deep block font-semibold">
              1. Acoustic Wavelet Filtering
            </strong>
            <p className="text-[11px] leading-relaxed">
              GutPatch microphone signals undergo spectral peak analysis to identify peristaltic sound burst clusters (&lt;500 Hz).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft space-y-1">
            <strong className="text-navy-deep block font-semibold">
              2. Medication Latency Matching
            </strong>
            <p className="text-[11px] leading-relaxed">
              Smart Medication Box timestamps calculate temporal latency between drug intake and gastrointestinal motility activation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-ivory/80 border border-border-soft space-y-1">
            <strong className="text-navy-deep block font-semibold">
              3. Autonomic Tone Alignment
            </strong>
            <p className="text-[11px] leading-relaxed">
              SmartBand EDA and PPG fluctuations detect sympathetic tone variations coincident with patient-reported distension.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonalInsights;
