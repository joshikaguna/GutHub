// src/pages/PatientProfilePage.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import {
  User,
  Activity,
  Heart,
  Scale,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { PatientProfile, Sex, ActivityLevel } from "../types";
import { storage } from "../services/storage";
import { calculatePersonalizedTargets } from "../services/nutritionDb";

const DIETARY_OPTIONS = [
  "Gluten-free",
  "Lactose-free",
  "Low-FODMAP",
  "Vegetarian",
  "Vegan",
  "Nut allergy",
  "Low sodium",
  "Dairy-sensitive",
];

const DEFAULT_PROFILE: PatientProfile = {
  fullName: "Alex Morgan",
  age: 34,
  dateOfBirth: "1992-04-18",
  sex: "Female",
  occupation: "Software Designer",
  weightKg: 64,
  heightCm: 168,
  address: "742 Evergreen Terrace, Medical District",
  activityLevel: "Lightly Active",
  dietaryRestrictions: ["Lactose-free", "Low-FODMAP"],
  onboardingCompleted: true,
};

const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfile>(() => {
    return storage.get<PatientProfile>("patient_profile", DEFAULT_PROFILE);
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Targets
  const targets = calculatePersonalizedTargets(profile);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.set("patient_profile", profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const toggleDietary = (item: string) => {
    const list = profile.dietaryRestrictions || [];
    if (list.includes(item)) {
      setProfile({
        ...profile,
        dietaryRestrictions: list.filter((i) => i !== item),
      });
    } else {
      setProfile({
        ...profile,
        dietaryRestrictions: [...list, item],
      });
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset profile to default baseline?")) {
      setProfile(DEFAULT_PROFILE);
      storage.set("patient_profile", DEFAULT_PROFILE);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Account & Biometrics
            </span>
            <span className="text-xs text-slate-muted">Patient Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Patient Settings & Energy Baseline
          </h1>
          <p className="text-xs text-slate-muted">
            Manage your physical parameters and dietary restrictions to calibrate nutritional algorithms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-border-soft text-slate-muted hover:bg-bg-ivory text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} /> Reset Baseline
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#EBF7F2] border border-[#C3E8DC] p-3.5 rounded-xl text-xs text-navy-deep flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 size={16} className="text-forest-green flex-shrink-0" />
          <span className="font-semibold">
            Patient profile and nutritional targets successfully updated and synchronized!
          </span>
        </div>
      )}

      {/* Target Preview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-border-soft shadow-subtle">
          <span className="text-[10.5px] uppercase font-semibold text-slate-muted tracking-wider">
            Basal Metabolic Rate
          </span>
          <div className="text-xl font-bold text-navy-deep font-display mt-1">
            {targets.bmr} <span className="text-xs font-normal text-slate-muted">kcal/day</span>
          </div>
          <p className="text-[10px] text-slate-muted mt-0.5">Mifflin-St Jeor equation</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-teal-japan/30 shadow-subtle">
          <span className="text-[10.5px] uppercase font-semibold text-teal-japan tracking-wider">
            Daily Energy Need (TDEE)
          </span>
          <div className="text-xl font-bold text-teal-japan font-display mt-1">
            {targets.targetCalories} <span className="text-xs font-normal text-teal-dark">kcal/day</span>
          </div>
          <p className="text-[10px] text-slate-muted mt-0.5">Adjusted for {profile.activityLevel}</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-[#C3E8DC] shadow-subtle">
          <span className="text-[10.5px] uppercase font-semibold text-forest-green tracking-wider">
            Daily Protein Target
          </span>
          <div className="text-xl font-bold text-forest-green font-display mt-1">
            {targets.targetProteinGrams} <span className="text-xs font-normal text-forest-green">g/day</span>
          </div>
          <p className="text-[10px] text-slate-muted mt-0.5">1.1 g/kg for GI integrity</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-soft shadow-subtle">
          <span className="text-[10.5px] uppercase font-semibold text-navy-deep tracking-wider">
            Target Dietary Fiber
          </span>
          <div className="text-xl font-bold text-navy-deep font-display mt-1">
            {targets.targetFiberGrams} <span className="text-xs font-normal text-slate-muted">g/day</span>
          </div>
          <p className="text-[10px] text-slate-muted mt-0.5">~14g per 1000 kcal intake</p>
        </div>
      </div>

      {/* Profile Form */}
      <Card
        title="Personal & Biometric Profile Details"
        subtitle="Modifications immediately recalibrate energy expenditure and meal requirements"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Full Name *
              </label>
              <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                <User size={15} className="text-slate-muted" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full text-xs text-navy-deep focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Sex *
              </label>
              <select
                value={profile.sex}
                onChange={(e) => setProfile({ ...profile, sex: e.target.value as Sex })}
                className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Date of Birth
              </label>
              <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                <Calendar size={15} className="text-slate-muted" />
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => {
                    const newDob = e.target.value;
                    const birthYear = new Date(newDob).getFullYear();
                    const currentYear = new Date().getFullYear();
                    const newAge = currentYear - birthYear;
                    setProfile({ ...profile, dateOfBirth: newDob, age: newAge > 0 ? newAge : profile.age });
                  }}
                  className="w-full text-xs text-navy-deep focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 30 })}
                className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                min="20"
                max="300"
                step="0.5"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: parseFloat(e.target.value) || 60 })}
                className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Height (cm) *
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value) || 165 })}
                className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Occupation
              </label>
              <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                <Briefcase size={15} className="text-slate-muted" />
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="w-full text-xs text-navy-deep focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Address / City
              </label>
              <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                <MapPin size={15} className="text-slate-muted" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full text-xs text-navy-deep focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-2">
              Physical Activity Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {(["Sedentary", "Lightly Active", "Moderately Active", "Very Active"] as ActivityLevel[]).map((level) => {
                const isSelected = profile.activityLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProfile({ ...profile, activityLevel: level })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-teal-light text-teal-dark border-teal-japan/50 font-semibold shadow-xs"
                        : "bg-surface hover:bg-bg-ivory text-navy-deep border-border-soft"
                    }`}
                  >
                    <div className="text-xs font-semibold">{level}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-2">
              Dietary Restrictions / Gastro Sensitivities
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((item) => {
                const isChecked = (profile.dietaryRestrictions || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isChecked
                        ? "bg-teal-japan text-white border-teal-japan shadow-xs"
                        : "bg-bg-ivory text-navy-deep border-border-soft hover:bg-surface"
                    }`}
                  >
                    {isChecked && <CheckCircle2 size={13} />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-2"
            >
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientProfilePage;
