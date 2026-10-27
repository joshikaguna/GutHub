// src/types.ts
export type UserRole = "patient";

export type Sex = "Male" | "Female" | "Non-binary" | "Prefer not to say";
export type ActivityLevel = "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";

export interface PatientProfile {
  fullName: string;
  age: number;
  dateOfBirth: string; // YYYY-MM-DD
  sex: Sex;
  occupation: string;
  weightKg: number;
  heightCm: number;
  address: string;
  activityLevel: ActivityLevel;
  dietaryRestrictions: string[]; // e.g., ["Gluten-free", "Lactose-free", "Low-FODMAP"]
  onboardingCompleted: boolean;
}

export interface Measurement {
  timestamp: string; // ISO string
  heartRate: number; // bpm
  skinTemp: number; // °C
  eda: number; // µS (Electrodermal Activity)
  activity: "Rest" | "Sedentary" | "Light Activity" | "Walking" | "Active";
  smartBandConnected: boolean;
  gutPatchConnected: boolean;
  signalQuality: "Optimal" | "Good" | "Fair" | "Degraded";
  movementArtifact: boolean;
}

export interface Symptom {
  id: string;
  timestamp: string;
  date?: string; // YYYY-MM-DD
  type: string; // "Abdominal pain" | "Cramps" | "Bloating" | "Nausea" | "Vomiting" | "Heartburn" | "Constipation-related" | "Diarrhea-related" | etc.
  severity: number; // 0-10
  notes?: string;
  associatedMeal?: string; // "Breakfast @ 08:15", "Lunch @ 12:45", etc.
  linkedMealId?: string;
  timingRelativeToMeal?: "pre-meal" | "post-meal" | "independent";
  simulated: boolean;
}

export type MedicationStatus = "scheduled" | "due" | "taken" | "missed" | "delayed";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  scheduledTime: string; // "08:00"
  status: MedicationStatus;
  takenAt?: string;
  notes?: string;
  simulated: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  category: "Grain" | "Protein" | "Vegetable" | "Fruit" | "Dairy/Alternative" | "Fat/Oil" | "Snack/Beverage";
  servingUnit: string; // "g", "ml", "cup", "slice", "piece", "tbsp", "serving"
  servingSize: number; // base amount (e.g. 100 for g/ml, 1 for slice/piece)
  calories: number; // kcal per base servingSize
  protein: number;  // g per base servingSize
  carbs: number;    // g per base servingSize
  fat: number;      // g per base servingSize
  fiber: number;    // g per base servingSize
  digestiveFriendly: boolean;
  digestiveNotes?: string;
  // Standard conversion helpers
  gramsPerPiece?: number;
  gramsPerCup?: number;
  gramsPerTbsp?: number;
}

export interface MealFoodItem {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isEstimated?: boolean;
}

export interface Meal {
  id: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  time: string;
  date?: string; // YYYY-MM-DD
  description?: string;
  items?: MealFoodItem[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  totalFiber?: number;
  // Pre- vs. Post-meal gastrointestinal markers
  preMealSymptomSeverity?: number; // 0-10
  postMealSymptomSeverity?: number; // 0-10
  preMealAcousticRate?: number; // events/min
  postMealAcousticRate?: number; // events/min
  preMealHeartRate?: number; // bpm
  postMealHeartRate?: number; // bpm
  simulated: boolean;
}

export interface BowelEvent {
  id: string;
  time: string;
  date?: string; // YYYY-MM-DD
  stoolForm: number; // 1-7 Bristol scale
  stoolDescription: string;
  urgency: "None" | "Mild" | "Moderate" | "Urgent";
  discomfort: "None" | "Mild" | "Moderate" | "Severe";
  notes?: string;
  simulated: boolean;
}

export interface GutPatchSession {
  id: string;
  sessionName: string;
  associatedMeal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  timePeriod: "Morning" | "Afternoon" | "Evening" | "Night";
  startTime: string;
  endTime?: string;
  date?: string; // YYYY-MM-DD
  linkedMealId?: string;
  status: "Active" | "Completed" | "Standby";
  acousticEventRate: number; // motility bowel sound rate (events/min)
  abdominalExpansionTrend: { minute: number; expansion: number; soundRate: number }[];
  signalQuality: "Optimal" | "Good" | "Artifact-Detected";
  movementArtifact: boolean;
  preMealAcousticRate: number;
  postMealAcousticRate: number;
  preMealSymptomSeverity?: number;
  postMealSymptomSeverity?: number;
  preMealHeartRate?: number;
  postMealHeartRate?: number;
  notes?: string;
  simulated: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: "SmartBand" | "GutPatch" | "Smart Medication Box";
  connected: boolean;
  battery: number; // 0 - 100
  lastUpdate: string;
  firmware: string;
  dataSource: "Simulated BLE Stream" | "Demo Virtual Sensor";
  signalStrengthDbm: number;
}

export interface PersonalInsight {
  id: string;
  title: string;
  category: "Motility Observation" | "Medication Correlate" | "Meal Transit Observation" | "Autonomic Pattern";
  summary: string;
  evidence: string;
  confidence: "Preliminary Pattern" | "Repeated Observation";
  timestamp: string;
  disclaimer: string;
}

export interface DailyNutritionTarget {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinGrams: number;
  targetFiberGrams: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  unlocked: boolean;
}

export interface StreakData {
  mealStreak: number;
  medStreak: number;
  longestMealStreak: number;
  longestMedStreak: number;
  weeklyMealDays: boolean[];
  weeklyMedDays: boolean[];
  achievements: AchievementBadge[];
}
