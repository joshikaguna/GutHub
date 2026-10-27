// src/pages/DailyTimeline.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import {
  Clock,
  Utensils,
  Pill,
  Heart,
  Radio,
  Activity,
  Filter,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { storage } from "../services/storage";
import {
  Meal,
  BowelEvent,
  Symptom,
  Medication,
  GutPatchSession,
} from "../types";

interface TimelineEvent {
  id: string;
  timeStr: string;
  category: "meal" | "medication" | "symptom" | "bowel" | "gpatch" | "sensor";
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

const DailyTimeline: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");

  const meals = storage.get<Meal[]>("meals", []);
  const bowels = storage.get<BowelEvent[]>("bowel", []);
  const symptoms = storage.get<Symptom[]>("symptoms", []);
  const medications = storage.get<Medication[]>("medications", []);
  const sessions = storage.get<GutPatchSession[]>("gpatch", []);

  // Construct combined chronological list
  const events: TimelineEvent[] = [];

  // 1. Meals
  meals.forEach((m) => {
    events.push({
      id: "ev-meal-" + m.id,
      timeStr: m.time,
      category: "meal",
      title: `Meal: ${m.type}`,
      description: m.description || "Logged meal consumption",
      tag: "Dietary",
      tagColor: "bg-teal-light text-teal-dark border-teal-japan/20",
    });
  });

  // 2. Bowel Events
  bowels.forEach((b) => {
    events.push({
      id: "ev-bow-" + b.id,
      timeStr: b.time,
      category: "bowel",
      title: `Bowel Movement (Bristol Form ${b.stoolForm})`,
      description: `${b.stoolDescription}. Urgency: ${b.urgency}, Discomfort: ${b.discomfort}.${b.notes ? ` Notes: "${b.notes}"` : ""}`,
      tag: `BSFS ${b.stoolForm}`,
      tagColor: "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]",
    });
  });

  // 3. Symptoms
  symptoms.forEach((s) => {
    const time = new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    events.push({
      id: "ev-sym-" + s.id,
      timeStr: time,
      category: "symptom",
      title: `Reported Symptom: ${s.type}`,
      description: `Severity: ${s.severity}/10.${s.notes ? ` Context: "${s.notes}"` : ""}`,
      tag: `Sev ${s.severity}/10`,
      tagColor: s.severity >= 5 ? "bg-coral-refined/10 text-coral-refined border-coral-refined/20" : "bg-amber-muted/15 text-amber-muted border-amber-muted/30",
    });
  });

  // 4. Medications
  medications.forEach((med) => {
    events.push({
      id: "ev-med-" + med.id,
      timeStr: med.scheduledTime,
      category: "medication",
      title: `Medication: ${med.name} (${med.dose})`,
      description: `Status: ${med.status.toUpperCase()}${med.takenAt ? ` (Verified at ${med.takenAt})` : ""}${med.notes ? ` - ${med.notes}` : ""}`,
      tag: med.status,
      tagColor: med.status === "taken" ? "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]" : "bg-bg-ivory text-slate-muted border-border-soft",
    });
  });

  // 5. GutPatch Sessions
  sessions.forEach((s) => {
    events.push({
      id: "ev-gpatch-" + s.id,
      timeStr: s.startTime,
      category: "gpatch",
      title: `GutPatch Session: ${s.sessionName}`,
      description: `Acoustic motility rate: ${s.acousticEventRate} events/min. Quality: ${s.signalQuality}. Baseline: ${s.preMealAcousticRate}/min → Post-meal: ${s.postMealAcousticRate}/min.`,
      tag: "Acoustic Motility",
      tagColor: "bg-teal-light text-teal-dark border-teal-japan/20",
    });
  });

  // Sort events chronologically by time string HH:MM
  events.sort((a, b) => a.timeStr.localeCompare(b.timeStr));

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.category === filter);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "meal":
        return <Utensils size={14} className="text-teal-japan" />;
      case "medication":
        return <Pill size={14} className="text-forest-green" />;
      case "symptom":
        return <Heart size={14} className="text-coral-refined" />;
      case "bowel":
        return <Activity size={14} className="text-navy-deep" />;
      case "gpatch":
        return <Radio size={14} className="text-teal-japan" />;
      default:
        return <Clock size={14} className="text-slate-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Multimodal Feed
            </span>
            <span className="text-xs text-slate-muted">Sequential Correlation View</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-navy-deep font-display">
            Daily Digestive-Health Timeline
          </h1>
          <p className="text-xs text-slate-muted">
            Chronological cross-correlation between meals, medication ingestion, gut acoustics, and symptoms
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: `All Events (${events.length})` },
          { key: "meal", label: `Meals (${meals.length})` },
          { key: "medication", label: `Meds (${medications.length})` },
          { key: "symptom", label: `Symptoms (${symptoms.length})` },
          { key: "bowel", label: `Bowel Events (${bowels.length})` },
          { key: "gpatch", label: `GutPatch (${sessions.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
              filter === tab.key
                ? "bg-teal-japan text-white border-teal-japan shadow-xs"
                : "bg-surface text-slate-muted hover:text-navy-deep border-border-soft hover:bg-bg-ivory"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Card */}
      <Card title="Chronological Sequence (24-Hour Observation)" subtitle="Examine temporal alignment without inferring direct causation">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-muted">
            No events match the selected category filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-soft">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-surface border-2 border-teal-japan shadow-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-japan" />
                </div>

                {/* Event Card */}
                <div className="bg-bg-ivory/80 hover:bg-bg-ivory transition-colors p-3.5 rounded-lg border border-border-soft space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-surface border border-border-soft/80 flex items-center justify-center">
                        {getCategoryIcon(ev.category)}
                      </div>
                      <h4 className="text-xs font-semibold text-navy-deep">{ev.title}</h4>
                      {ev.tag && (
                        <span className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded border ${ev.tagColor}`}>
                          {ev.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-muted flex-shrink-0">
                      <Clock size={11} />
                      <span>{ev.timeStr}</span>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-slate-muted leading-relaxed pl-8 sm:pl-0">
                    {ev.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DailyTimeline;
