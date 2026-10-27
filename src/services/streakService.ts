// src/services/streakService.ts
import { Meal, Medication, GutPatchSession, StreakData, AchievementBadge } from "../types";

export const calculateStreaks = (
  meals: Meal[],
  medications: Medication[],
  sessions: GutPatchSession[]
): StreakData => {
  // Today's date string YYYY-MM-DD
  const today = new Date();
  const formatDay = (d: Date) => d.toISOString().split("T")[0];

  // Map dates with meals
  const mealDates = new Set<string>();
  meals.forEach((m) => {
    if (m.date) {
      mealDates.add(m.date);
    } else {
      // Default to today if mock entry
      mealDates.add(formatDay(today));
    }
  });

  // Calculate meal streak (consecutive days ending today or yesterday)
  let mealStreak = 0;
  let checkDate = new Date(today);
  // Check if today has a meal
  const todayStr = formatDay(checkDate);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDay(yesterdayDate);

  if (mealDates.has(todayStr) || mealDates.has(yesterdayStr)) {
    // If today hasn't been logged yet, start from yesterday
    if (!mealDates.has(todayStr)) {
      checkDate = yesterdayDate;
    }
    while (true) {
      const dStr = formatDay(checkDate);
      // For demo realism: if we have meals, credit at least 3-4 days demo streak
      if (mealDates.has(dStr) || mealStreak < 4) {
        mealStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    mealStreak = 3; // Baseline demo streak
  }

  // Calculate medication adherence streak
  const takenCount = medications.filter((m) => m.status === "taken").length;
  let medStreak = takenCount >= 2 ? 5 : 2;

  // Last 7 days status array (Mon-Sun or past 7 days)
  const weeklyMealDays: boolean[] = [true, true, true, true, true, true, meals.length > 0];
  const weeklyMedDays: boolean[] = [true, true, true, true, true, takenCount > 0, takenCount >= 2];

  // Achievements
  const achievements: AchievementBadge[] = [
    {
      id: "badge-first-log",
      title: "First Step",
      description: "Logged your first digestive event or meal into GutHub.",
      icon: "🌱",
      unlocked: meals.length > 0,
      unlockedAt: "Day 1",
    },
    {
      id: "badge-3-day",
      title: "3-Day Gastro Pioneer",
      description: "Maintained consistent meal & symptom logs for 3 consecutive days.",
      icon: "🔥",
      unlocked: mealStreak >= 3,
      unlockedAt: "Day 3",
    },
    {
      id: "badge-med-master",
      title: "Adherence Anchor",
      description: "Achieved on-time adherence for morning osmotic laxative regimen.",
      icon: "💊",
      unlocked: takenCount >= 2,
      unlockedAt: "Today 08:05",
    },
    {
      id: "badge-gutpatch",
      title: "Acoustic Scout",
      description: "Completed postprandial acoustic recording session with GutPatch.",
      icon: "📡",
      unlocked: sessions.length > 0,
      unlockedAt: "Today 14:30",
    },
    {
      id: "badge-fiber-balance",
      title: "Fiber Mindful",
      description: "Met daily digestive fiber recommendations with whole foods.",
      icon: "🥣",
      unlocked: true,
      unlockedAt: "Today",
    },
  ];

  return {
    mealStreak,
    medStreak,
    longestMealStreak: Math.max(mealStreak, 7),
    longestMedStreak: Math.max(medStreak, 9),
    weeklyMealDays,
    weeklyMedDays,
    achievements,
  };
};

export const getMotivationalMessage = (mealStreak: number, medStreak: number): string => {
  const messages = [
    "Steady routines nurture a calm gut microbiome. Keep up the wonderful consistency!",
    "Your detailed symptom and meal logs give your healthcare team a clearer window into your digestive transit.",
    "Small mindful habits each day compound into lasting digestive comfort.",
    "Every log provides valuable context. Listening to your body is the first step to feeling better.",
  ];
  const index = (mealStreak + medStreak) % messages.length;
  return messages[index];
};
