// src/pages/MedicationManagement.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  Check,
  ChevronRight,
  Info,
} from "lucide-react";
import { Medication, MedicationStatus } from "../types";
import { storage } from "../services/storage";

const MedicationManagement: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>(() =>
    storage.get<Medication[]>("medications", [])
  );

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dose.trim()) return;

    const newMed: Medication = {
      id: "med-" + Date.now(),
      name: name.trim(),
      dose: dose.trim(),
      scheduledTime,
      status: "scheduled",
      notes: notes.trim() || undefined,
      simulated: true,
    };

    const updated = [...medications, newMed];
    setMedications(updated);
    storage.set("medications", updated);

    setName("");
    setDose("");
    setNotes("");
    setShowAddModal(false);
  };

  const handleStatusChange = (id: string, newStatus: MedicationStatus) => {
    const updated = medications.map((med) => {
      if (med.id === id) {
        return {
          ...med,
          status: newStatus,
          takenAt:
            newStatus === "taken"
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
        };
      }
      return med;
    });
    setMedications(updated);
    storage.set("medications", updated);
  };

  const handleDelete = (id: string) => {
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    storage.set("medications", updated);
  };

  const total = medications.length;
  const takenCount = medications.filter((m) => m.status === "taken").length;
  const adherenceRate = total > 0 ? Math.round((takenCount / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Prescription Adherence
            </span>
            <span className="text-xs text-slate-muted">Smart Medication Box Connected</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-navy-deep font-display">
            Medication Adherence & Daily Regimen
          </h1>
          <p className="text-xs text-slate-muted">
            Osmotic laxatives, antispasmodics, and motility agents verified via BLE compartment lid sensors
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex-shrink-0"
        >
          <Plus size={14} /> Add Dose Schedule
        </button>
      </div>

      {/* 3 Metrics Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card noPadding className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-light text-teal-japan flex items-center justify-center font-bold text-lg font-display flex-shrink-0">
            {adherenceRate}%
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
              Adherence Compliance
            </div>
            <div className="text-sm font-bold text-navy-deep mt-0.5">
              {takenCount} of {total} doses confirmed
            </div>
          </div>
        </Card>

        <Card noPadding className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] text-forest-green flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
              SmartBox BLE Link
            </div>
            <div className="text-sm font-bold text-navy-deep mt-0.5">
              Lid sensor active & syncing
            </div>
          </div>
        </Card>

        <Card noPadding className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-ivory text-navy-deep flex items-center justify-center flex-shrink-0 border border-border-soft">
            <Clock size={20} className="text-slate-muted" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
              Next Pending Dose
            </div>
            <div className="text-sm font-bold text-navy-deep mt-0.5 truncate">
              {medications.find((m) => m.status !== "taken")?.name || "All daily doses taken"}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Medication Modal/Form */}
      {showAddModal && (
        <Card title="Add Medication Schedule" subtitle="Integrate prescription into daily monitoring timeline">
          <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Polyethylene Glycol"
                className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Dosage & Unit *
              </label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 17g in 8oz water"
                className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Scheduled Time *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Clinical Context
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Morning dose with water"
                className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-muted hover:bg-bg-ivory"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-japan text-white text-xs font-medium shadow-xs hover:bg-teal-dark"
              >
                Save Medication
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Daily Scheduled Medication Ledger */}
      <Card
        title="Daily Schedule & Intake Verification"
        subtitle="Cross-verified with Smart Medication Box compartment sensors"
      >
        <div className="space-y-3">
          {medications.map((med) => {
            const isTaken = med.status === "taken";
            const isDue = med.status === "due";
            const isMissed = med.status === "missed";
            const isDelayed = med.status === "delayed";

            return (
              <div
                key={med.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isTaken
                    ? "bg-surface border-border-soft"
                    : isDue
                    ? "bg-[#FFFDF5] border-amber-muted/40"
                    : isMissed
                    ? "bg-[#FFF5F4] border-coral-refined/40"
                    : "bg-bg-ivory/60 border-border-soft"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isTaken
                        ? "bg-[#EBF7F2] text-forest-green"
                        : isDue
                        ? "bg-amber-muted/15 text-amber-muted"
                        : isMissed
                        ? "bg-coral-refined/15 text-coral-refined"
                        : "bg-bg-ivory text-slate-muted border border-border-soft"
                    }`}
                  >
                    <Pill size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-navy-deep">{med.name}</h4>
                      <span className="text-[11px] font-medium px-2 py-0.2 rounded bg-bg-ivory text-slate-muted border border-border-soft">
                        {med.dose}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isTaken
                            ? "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]"
                            : isDue
                            ? "bg-[#FFFDF5] text-amber-muted border-amber-muted/30"
                            : isMissed
                            ? "bg-[#FFF5F4] text-coral-refined border-coral-refined/30"
                            : "bg-bg-ivory text-slate-muted border-border-soft"
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Scheduled: <strong>{med.scheduledTime}</strong>
                      </span>
                      {isTaken && med.takenAt && (
                        <span className="text-forest-green font-medium">
                          ✓ Verified at {med.takenAt} (SmartBox)
                        </span>
                      )}
                      {med.notes && <span className="italic">({med.notes})</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                  {isTaken ? (
                    <button
                      onClick={() => handleStatusChange(med.id, "scheduled")}
                      className="text-xs text-slate-muted hover:text-navy-deep underline px-2 py-1"
                    >
                      Undo Intake
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusChange(med.id, "taken")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium shadow-xs transition-colors"
                      >
                        <Check size={13} /> Confirm Dose
                      </button>

                      <button
                        onClick={() => handleStatusChange(med.id, "delayed")}
                        className="px-2.5 py-1.5 rounded-lg bg-bg-ivory hover:bg-[#EBEBE3] text-navy-deep text-xs border border-border-soft font-medium"
                      >
                        Delayed
                      </button>

                      <button
                        onClick={() => handleStatusChange(med.id, "missed")}
                        className="px-2.5 py-1.5 rounded-lg bg-coral-refined/10 hover:bg-coral-refined/20 text-coral-refined text-xs border border-coral-refined/20 font-medium"
                      >
                        Missed
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-1.5 text-slate-muted/50 hover:text-coral-refined transition-colors ml-1"
                    title="Remove from regimen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default MedicationManagement;
