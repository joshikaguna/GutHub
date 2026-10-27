// src/pages/OnboardingPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Heart,
  Scale,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  Briefcase,
  Flame,
} from "lucide-react";
import Card from "../components/Card";
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

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState<string>("Alex Morgan");
  const [age, setAge] = useState<number>(34);
  const [dateOfBirth, setDateOfBirth] = useState<string>("1992-04-18");
  const [sex, setSex] = useState<Sex>("Female");
  const [occupation, setOccupation] = useState<string>("Software Designer");
  const [weightKg, setWeightKg] = useState<number>(64);
  const [heightCm, setHeightCm] = useState<number>(168);
  const [address, setAddress] = useState<string>("742 Evergreen Terrace, Medical District");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("Lightly Active");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([
    "Lactose-free",
    "Low-FODMAP",
  ]);

  const toggleDietary = (item: string) => {
    if (dietaryRestrictions.includes(item)) {
      setDietaryRestrictions(dietaryRestrictions.filter((i) => i !== item));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, item]);
    }
  };

  const currentProfile: PatientProfile = {
    fullName,
    age,
    dateOfBirth,
    sex,
    occupation,
    weightKg,
    heightCm,
    address,
    activityLevel,
    dietaryRestrictions,
    onboardingCompleted: true,
  };

  const calculatedTargets = calculatePersonalizedTargets(currentProfile);

  const handleCompleteOnboarding = () => {
    storage.set("patient_profile", currentProfile);
    navigate("/patient");
  };

  const handlePreFillDemo = () => {
    setFullName("Alex Morgan");
    setAge(34);
    setDateOfBirth("1992-04-18");
    setSex("Female");
    setOccupation("Software Designer");
    setWeightKg(64);
    setHeightCm(168);
    setAddress("742 Evergreen Terrace, Medical District");
    setActivityLevel("Lightly Active");
    setDietaryRestrictions(["Lactose-free", "Low-FODMAP"]);
  };

  return (
    <div className="min-h-screen bg-bg-ivory flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Brand Identity */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src="/guthub-logo.jpg"
              alt="GutHub Official Logo"
              className="w-16 h-16 rounded-2xl object-contain bg-white p-1.5 border border-border-soft shadow-subtle"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-light text-teal-dark border border-teal-japan/20 text-xs font-medium">
            <Sparkles size={13} className="text-teal-japan" />
            <span>MEDAITHON '26 Patient Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-deep font-display mt-2">
            Gut<span className="text-teal-japan">Hub</span> Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted">
            Configure your digestive profile to personalize sensor baseline metrics & nutrition targets
          </p>
        </div>

        {/* Multi-Step Stepper Header */}
        <div className="bg-surface rounded-xl border border-border-soft p-3 sm:p-4 shadow-subtle flex items-center justify-between">
          {[
            { num: 1, label: "Welcome" },
            { num: 2, label: "Demographics" },
            { num: 3, label: "Activity & Diet" },
            { num: 4, label: "Review & Targets" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? "bg-teal-japan text-white shadow-xs"
                    : step > s.num
                    ? "bg-forest-green text-white"
                    : "bg-bg-ivory text-slate-muted border border-border-soft"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  step === s.num ? "font-bold text-navy-deep" : "text-slate-muted"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Welcome & Overview */}
        {step === 1 && (
          <div className="bg-surface rounded-xl border border-border-soft p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-teal-japan uppercase tracking-wider">
                Step 1 of 4 • Platform Introduction
              </span>
              <h2 className="text-xl font-bold text-navy-deep font-display">
                Welcome to GutHub Health Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
                GutHub bridges non-invasive bio-acoustic wearable sensing (GutPatch), vital signs telemetry (SmartBand), and medication adherence tracking into a cohesive digestive health timeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-bg-ivory/80 border border-border-soft text-left space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-teal-light text-teal-japan flex items-center justify-center">
                  <Heart size={16} />
                </div>
                <div className="text-xs font-semibold text-navy-deep">Multimodal Sensing</div>
                <div className="text-[11px] text-slate-muted leading-relaxed">
                  Real-time heart rate, skin temp, electrodermal activity, and bowel sound rates.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-ivory/80 border border-border-soft text-left space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7F2] text-forest-green flex items-center justify-center">
                  <Scale size={16} />
                </div>
                <div className="text-xs font-semibold text-navy-deep">Smart Nutrition</div>
                <div className="text-[11px] text-slate-muted leading-relaxed">
                  Quantity-based food logging with Mifflin-St Jeor daily energy & protein estimation.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-ivory/80 border border-border-soft text-left space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-mist-blue text-navy-deep flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-xs font-semibold text-navy-deep">Doctor-Ready</div>
                <div className="text-[11px] text-slate-muted leading-relaxed">
                  Exportable summary sheets combining BSFS stool logs, adherence, and motility data.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-mist-blue/60 border border-border-soft text-xs text-navy-deep flex items-start gap-2.5">
              <Info size={16} className="text-teal-japan flex-shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-slate-muted">
                <strong>Non-Diagnostic Notice:</strong> GutHub is an investigational medical technology prototype. Measurements and calculated targets are exploratory indicators to assist clinical pair-review, not standalone diagnostic prescriptions.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePreFillDemo}
                className="text-xs text-teal-japan hover:underline font-medium"
              >
                Pre-fill Demonstration Profile
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
              >
                Continue to Demographics <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Demographics */}
        {step === 2 && (
          <div className="bg-surface rounded-xl border border-border-soft p-6 sm:p-8 shadow-subtle space-y-5">
            <div>
              <span className="text-xs font-semibold text-teal-japan uppercase tracking-wider">
                Step 2 of 4 • Patient Demographics
              </span>
              <h2 className="text-xl font-bold text-navy-deep font-display mt-0.5">
                Personal & Biometric Information
              </h2>
              <p className="text-xs text-slate-muted">
                Enter your physical parameters to compute basal metabolic rate (BMR) and daily protein requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Full Name *
                </label>
                <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                  <User size={15} className="text-slate-muted" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs text-navy-deep focus:outline-none"
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Biological / Assigned Sex *
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
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
                  Date of Birth *
                </label>
                <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                  <Calendar size={15} className="text-slate-muted" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      if (e.target.value) {
                        const birthYear = new Date(e.target.value).getFullYear();
                        const currentYear = new Date().getFullYear();
                        if (birthYear > 1900 && currentYear > birthYear) {
                          setAge(currentYear - birthYear);
                        }
                      }
                    }}
                    className="w-full text-xs text-navy-deep focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Calculated Age (Years) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                  className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Current Weight (kg) *
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
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
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 165)}
                  className="w-full border border-border-soft rounded-lg p-2 bg-surface text-xs text-navy-deep focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Occupation (Optional)
                </label>
                <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                  <Briefcase size={15} className="text-slate-muted" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full text-xs text-navy-deep focus:outline-none"
                    placeholder="e.g. Software Designer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Residential Address / City
                </label>
                <div className="flex items-center gap-2 border border-border-soft rounded-lg p-2 bg-surface">
                  <MapPin size={15} className="text-slate-muted" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs text-navy-deep focus:outline-none"
                    placeholder="e.g. 742 Evergreen Terrace"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-border-soft text-slate-muted hover:bg-bg-ivory text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
              >
                Next: Activity & Diet <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Activity & Diet */}
        {step === 3 && (
          <div className="bg-surface rounded-xl border border-border-soft p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <span className="text-xs font-semibold text-teal-japan uppercase tracking-wider">
                Step 3 of 4 • Lifestyle & Sensitivities
              </span>
              <h2 className="text-xl font-bold text-navy-deep font-display mt-0.5">
                Activity Level & Dietary Restrictions
              </h2>
              <p className="text-xs text-slate-muted">
                These settings filter personalized food recommendations and calibrate energy expenditure.
              </p>
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                Daily Physical Activity Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { level: "Sedentary" as ActivityLevel, desc: "Desk job, little to no structured exercise (TDEE × 1.2)" },
                  { level: "Lightly Active" as ActivityLevel, desc: "Light exercise / walking 1-3 days/week (TDEE × 1.375)" },
                  { level: "Moderately Active" as ActivityLevel, desc: "Moderate exercise 3-5 days/week (TDEE × 1.55)" },
                  { level: "Very Active" as ActivityLevel, desc: "Heavy exercise or physical job 6-7 days/week (TDEE × 1.725)" },
                ].map((act) => {
                  const isSelected = activityLevel === act.level;
                  return (
                    <button
                      key={act.level}
                      type="button"
                      onClick={() => setActivityLevel(act.level)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-teal-light text-teal-dark border-teal-japan/50 font-semibold shadow-xs"
                          : "bg-surface hover:bg-bg-ivory text-navy-deep border-border-soft"
                      }`}
                    >
                      <div className="text-xs font-semibold">{act.level}</div>
                      <div className="text-[11px] text-slate-muted mt-0.5 leading-snug">
                        {act.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Restrictions Pills */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                Dietary Restrictions / Gastro Sensitivities (Select All That Apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((item) => {
                  const isChecked = dietaryRestrictions.includes(item);
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

            <div className="flex items-center justify-between pt-4 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg border border-border-soft text-slate-muted hover:bg-bg-ivory text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
              >
                Review & Calculate Targets <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Calculated Targets Preview */}
        {step === 4 && (
          <div className="bg-surface rounded-xl border border-border-soft p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <span className="text-xs font-semibold text-teal-japan uppercase tracking-wider">
                Step 4 of 4 • Nutritional Target Calibration
              </span>
              <h2 className="text-xl font-bold text-navy-deep font-display mt-0.5">
                Profile Review & Daily Targets
              </h2>
              <p className="text-xs text-slate-muted">
                Calculated using the clinical standard Mifflin-St Jeor formula calibrated to your parameters.
              </p>
            </div>

            {/* Calculated Targets Display Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-bg-ivory border border-border-soft text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-muted tracking-wider">
                  Basal BMR
                </span>
                <div className="text-lg font-bold text-navy-deep font-display mt-1">
                  {calculatedTargets.bmr} <span className="text-xs font-normal text-slate-muted">kcal</span>
                </div>
                <span className="text-[9.5px] text-slate-muted">Resting rate</span>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-light/50 border border-teal-japan/30 text-center">
                <span className="text-[10px] uppercase font-semibold text-teal-dark tracking-wider">
                  Target Energy
                </span>
                <div className="text-lg font-bold text-teal-japan font-display mt-1">
                  {calculatedTargets.targetCalories} <span className="text-xs font-normal text-teal-dark">kcal</span>
                </div>
                <span className="text-[9.5px] text-teal-dark/80">TDEE Adjusted</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EBF7F2] border border-[#C3E8DC] text-center">
                <span className="text-[10px] uppercase font-semibold text-forest-green tracking-wider">
                  Target Protein
                </span>
                <div className="text-lg font-bold text-forest-green font-display mt-1">
                  {calculatedTargets.targetProteinGrams} <span className="text-xs font-normal text-forest-green">g</span>
                </div>
                <span className="text-[9.5px] text-forest-green/80">1.1 g/kg wt</span>
              </div>

              <div className="p-3.5 rounded-xl bg-mist-blue border border-border-soft text-center">
                <span className="text-[10px] uppercase font-semibold text-navy-deep tracking-wider">
                  Dietary Fiber
                </span>
                <div className="text-lg font-bold text-navy-deep font-display mt-1">
                  {calculatedTargets.targetFiberGrams} <span className="text-xs font-normal text-slate-muted">g</span>
                </div>
                <span className="text-[9.5px] text-slate-muted">GI transit buffer</span>
              </div>
            </div>

            {/* Profile Summary Details */}
            <div className="bg-bg-ivory/80 rounded-xl p-4 border border-border-soft text-xs space-y-2">
              <div className="text-[11px] font-semibold text-navy-deep uppercase tracking-wider">
                Confirmed Profile Credentials
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-muted">
                <div>Patient: <strong className="text-navy-deep">{fullName}</strong></div>
                <div>Age / Sex: <strong className="text-navy-deep">{age} yrs • {sex}</strong></div>
                <div>Body Mass: <strong className="text-navy-deep">{weightKg} kg • {heightCm} cm</strong></div>
                <div>Activity: <strong className="text-navy-deep">{activityLevel}</strong></div>
                <div className="col-span-2">
                  Dietary Tags:{" "}
                  {dietaryRestrictions.length > 0 ? (
                    <span className="text-navy-deep font-medium">
                      {dietaryRestrictions.join(", ")}
                    </span>
                  ) : (
                    <span className="text-slate-muted">None indicated</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg border border-border-soft text-slate-muted hover:bg-bg-ivory text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                className="px-6 py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white text-xs font-semibold tracking-wide transition-colors shadow-subtle flex items-center gap-2"
              >
                Complete Onboarding & Enter GutHub <CheckCircle2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
