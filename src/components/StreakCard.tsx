// src/components/StreakCard.tsx
import React, { useState } from "react";
import {
  Flame,
  Pill,
  Utensils,
  Award,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StreakData } from "../types";
import { getMotivationalMessage } from "../services/streakService";

interface StreakCardProps {
  streakData: StreakData;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const StreakCard: React.FC<StreakCardProps> = ({ streakData }) => {
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const motivationalMessage = getMotivationalMessage(
    streakData.mealStreak,
    streakData.medStreak
  );

  return (
    <div className="bg-surface rounded-xl border border-border-soft p-5 sm:p-6 shadow-subtle space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Patient Motivation & Consistency
            </span>
            <span className="text-xs text-slate-muted">Adherence Health Engine</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-navy-deep font-display">
            Consistency Streaks & Weekly Cadence
          </h3>
          <p className="text-xs text-slate-muted">
            Tracking your daily meal logging and medication compliance routines
          </p>
        </div>

        {/* Motivational Pill Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-ivory border border-border-soft text-xs text-navy-deep max-w-sm">
          <Sparkles size={14} className="text-teal-japan flex-shrink-0" />
          <span className="text-[11px] leading-snug italic text-slate-muted">
            "{motivationalMessage}"
          </span>
        </div>
      </div>

      {/* Dual Streak Counters & Weekly Dot Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Meal Logging Streak Card */}
        <div className="p-4 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-light text-teal-japan flex items-center justify-center">
                <Utensils size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted">
                  Meal Logging Streak
                </span>
                <div className="text-xl font-bold text-navy-deep font-display leading-tight">
                  {streakData.mealStreak}{" "}
                  <span className="text-xs font-normal text-slate-muted">Days in a Row</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-forest-green px-2 py-0.5 rounded bg-[#EBF7F2] border border-[#C3E8DC]">
              <Flame size={12} className="text-amber-muted" /> Active Streak
            </div>
          </div>

          {/* 7-Day Consistency Dots */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-muted uppercase font-semibold mb-1.5">
              <span>Past 7 Days Consistency</span>
              <span>Longest: {streakData.longestMealStreak}d</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day, idx) => {
                const isLogged = streakData.weeklyMealDays[idx];
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[9.5px] text-slate-muted font-medium">{day}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isLogged
                          ? "bg-teal-japan text-white shadow-xs"
                          : "bg-surface border border-border-soft text-slate-muted/50"
                      }`}
                      title={`${day}: ${isLogged ? "Meals logged" : "No entry"}`}
                    >
                      {isLogged ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Medication Adherence Streak Card */}
        <div className="p-4 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBF7F2] text-forest-green flex items-center justify-center">
                <Pill size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted">
                  Medication Adherence
                </span>
                <div className="text-xl font-bold text-navy-deep font-display leading-tight">
                  {streakData.medStreak}{" "}
                  <span className="text-xs font-normal text-slate-muted">Days on Schedule</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-dark px-2 py-0.5 rounded bg-teal-light border border-teal-japan/30">
              <CheckCircle2 size={12} /> 100% Adherent
            </div>
          </div>

          {/* 7-Day Consistency Dots */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-muted uppercase font-semibold mb-1.5">
              <span>SmartBox Intake Confirmations</span>
              <span>Longest: {streakData.longestMedStreak}d</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day, idx) => {
                const isTaken = streakData.weeklyMedDays[idx];
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[9.5px] text-slate-muted font-medium">{day}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isTaken
                          ? "bg-forest-green text-white shadow-xs"
                          : "bg-surface border border-border-soft text-slate-muted/50"
                      }`}
                      title={`${day}: ${isTaken ? "Medication taken" : "Pending/Missed"}`}
                    >
                      {isTaken ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Milestones Toggle */}
      <div className="pt-2 border-t border-border-soft">
        <button
          type="button"
          onClick={() => setShowAchievements(!showAchievements)}
          className="flex items-center justify-between w-full text-xs font-semibold text-navy-deep hover:text-teal-japan transition-colors"
        >
          <div className="flex items-center gap-2">
            <Award size={15} className="text-amber-muted" />
            <span>Milestone Achievements ({streakData.achievements.filter((a) => a.unlocked).length} Unlocked)</span>
          </div>
          {showAchievements ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showAchievements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3">
            {streakData.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                  ach.unlocked
                    ? "bg-surface border-border-soft shadow-xs"
                    : "bg-bg-ivory/50 border-border-soft/60 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ach.icon}</span>
                    <span className="font-bold text-navy-deep">{ach.title}</span>
                  </div>
                  {ach.unlocked && (
                    <span className="text-[9.5px] text-forest-green font-semibold bg-[#EBF7F2] px-1.5 py-0.2 rounded border border-[#C3E8DC]">
                      {ach.unlockedAt || "Unlocked"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-muted leading-snug">{ach.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakCard;
