// src/services/storage.ts
import {
  Measurement,
  Symptom,
  Medication,
  Meal,
  BowelEvent,
  GutPatchSession,
  DeviceInfo,
  PersonalInsight,
  PatientProfile,
} from "../types";

export const INITIAL_PROFILE: PatientProfile = {
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

const INITIAL_MEASUREMENT: Measurement = {
  timestamp: new Date().toISOString(),
  heartRate: 74,
  skinTemp: 36.6,
  eda: 2.4, // microsiemens
  activity: "Rest",
  smartBandConnected: true,
  gutPatchConnected: true,
  signalQuality: "Optimal",
  movementArtifact: false,
};

// Seed realistic multi-day symptom records spanning the last 14 days
const now = Date.now();
const dayMs = 24 * 3600 * 1000;
const todayDateStr = new Date().toISOString().split("T")[0];

const INITIAL_SYMPTOMS: Symptom[] = [
  // Today - Lunch Postprandial
  {
    id: "sym-1",
    timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
    date: todayDateStr,
    type: "Bloating",
    severity: 4,
    notes: "Postprandial distension noted ~45 minutes after lunch; subsided with light walking.",
    associatedMeal: "Lunch @ 12:45",
    linkedMealId: "meal-2",
    timingRelativeToMeal: "post-meal",
    simulated: true,
  },
  // Today - Pre-Lunch Baseline
  {
    id: "sym-1b",
    timestamp: new Date(now - 3.5 * 3600 * 1000).toISOString(),
    date: todayDateStr,
    type: "Bloating",
    severity: 2,
    notes: "Pre-lunch fasting baseline comfort level.",
    associatedMeal: "Lunch @ 12:45",
    linkedMealId: "meal-2",
    timingRelativeToMeal: "pre-meal",
    simulated: true,
  },
  // Today - Breakfast Postprandial
  {
    id: "sym-2",
    timestamp: new Date(now - 6 * 3600 * 1000).toISOString(),
    date: todayDateStr,
    type: "Abdominal pain",
    severity: 2,
    notes: "Very mild sensation, excellent tolerance of oats and berries.",
    associatedMeal: "Breakfast @ 08:15",
    linkedMealId: "meal-1",
    timingRelativeToMeal: "post-meal",
    simulated: true,
  },
  {
    id: "sym-2b",
    timestamp: new Date(now - 7 * 3600 * 1000).toISOString(),
    date: todayDateStr,
    type: "Abdominal pain",
    severity: 1,
    notes: "Pre-breakfast baseline upon waking.",
    associatedMeal: "Breakfast @ 08:15",
    linkedMealId: "meal-1",
    timingRelativeToMeal: "pre-meal",
    simulated: true,
  },
  // Yesterday
  {
    id: "sym-3",
    timestamp: new Date(now - 1 * dayMs - 4 * 3600 * 1000).toISOString(),
    type: "Bloating",
    severity: 4,
    notes: "Moderate fullness post-dinner.",
    associatedMeal: "Dinner @ 19:30",
    simulated: true,
  },
  // Day -2
  {
    id: "sym-4",
    timestamp: new Date(now - 2 * dayMs - 6 * 3600 * 1000).toISOString(),
    type: "Heartburn",
    severity: 3,
    notes: "Mild acidic sensation in upper chest.",
    simulated: true,
  },
  // Day -3
  {
    id: "sym-5",
    timestamp: new Date(now - 3 * dayMs - 5 * 3600 * 1000).toISOString(),
    type: "Bloating",
    severity: 5,
    notes: "Abdominal tightness after restaurant meal.",
    simulated: true,
  },
  // Day -5
  {
    id: "sym-6",
    timestamp: new Date(now - 5 * dayMs - 3 * 3600 * 1000).toISOString(),
    type: "Cramps",
    severity: 5,
    notes: "Mid-afternoon intermittent colic spasms.",
    simulated: true,
  },
  // Day -7
  {
    id: "sym-7",
    timestamp: new Date(now - 7 * dayMs - 8 * 3600 * 1000).toISOString(),
    type: "Bloating",
    severity: 6,
    notes: "Considerable distension before bedtime.",
    simulated: true,
  },
  // Day -9
  {
    id: "sym-8",
    timestamp: new Date(now - 9 * dayMs - 4 * 3600 * 1000).toISOString(),
    type: "Abdominal pain",
    severity: 6,
    notes: "Cramping and delayed evacuation sensation.",
    simulated: true,
  },
  // Day -12
  {
    id: "sym-9",
    timestamp: new Date(now - 12 * dayMs - 6 * 3600 * 1000).toISOString(),
    type: "Bloating",
    severity: 7,
    notes: "Severe bloating after heavy dairy intake prior to lactose elimination.",
    simulated: true,
  },
  // Day -14
  {
    id: "sym-10",
    timestamp: new Date(now - 14 * dayMs - 5 * 3600 * 1000).toISOString(),
    type: "Nausea",
    severity: 6,
    notes: "Postprandial nausea, improved following gut motility therapy initiation.",
    simulated: true,
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    name: "Polyethylene Glycol 3350",
    dose: "17g in 8oz water",
    scheduledTime: "08:00",
    status: "taken",
    takenAt: "08:05",
    notes: "Taken with breakfast.",
    simulated: true,
  },
  {
    id: "med-2",
    name: "Dicyclomine HCl",
    dose: "10 mg",
    scheduledTime: "13:00",
    status: "taken",
    takenAt: "13:12",
    notes: "Taken before lunch.",
    simulated: true,
  },
  {
    id: "med-3",
    name: "Spore Probiotic Complex",
    dose: "1 Capsule (5B CFU)",
    scheduledTime: "20:30",
    status: "due",
    notes: "Scheduled with evening light snack.",
    simulated: true,
  },
  {
    id: "med-4",
    name: "Magnesium Citrate",
    dose: "200 mg",
    scheduledTime: "22:00",
    status: "scheduled",
    notes: "Bedtime supplement.",
    simulated: true,
  },
];

const INITIAL_MEALS: Meal[] = [
  {
    id: "meal-1",
    type: "Breakfast",
    time: "08:15",
    date: todayDateStr,
    description: "Rolled oats with blueberries, chia seeds, and unsweetened almond milk.",
    items: [
      {
        foodId: "food-oats",
        name: "Rolled Oats (Dry)",
        quantity: 60,
        unit: "g",
        calories: 233,
        protein: 10.1,
        carbs: 39.8,
        fat: 4.1,
        fiber: 6.4,
        isEstimated: false,
      },
      {
        foodId: "food-blueberries",
        name: "Fresh Blueberries",
        quantity: 50,
        unit: "g",
        calories: 29,
        protein: 0.4,
        carbs: 7.3,
        fat: 0.2,
        fiber: 1.2,
        isEstimated: false,
      },
      {
        foodId: "food-chia-seeds",
        name: "Chia Seeds (Hydrated)",
        quantity: 1,
        unit: "tbsp",
        calories: 58,
        protein: 2.0,
        carbs: 5.0,
        fat: 3.7,
        fiber: 4.1,
        isEstimated: false,
      },
      {
        foodId: "food-almond-milk",
        name: "Unsweetened Almond Milk",
        quantity: 200,
        unit: "ml",
        calories: 30,
        protein: 1.2,
        carbs: 0.6,
        fat: 2.6,
        fiber: 0.4,
        isEstimated: false,
      },
    ],
    totalCalories: 350,
    totalProtein: 13.7,
    totalCarbs: 52.7,
    totalFat: 10.6,
    totalFiber: 12.1,
    preMealSymptomSeverity: 1,
    postMealSymptomSeverity: 2,
    preMealAcousticRate: 4.8,
    postMealAcousticRate: 15.2,
    preMealHeartRate: 71,
    postMealHeartRate: 75,
    simulated: true,
  },
  {
    id: "meal-2",
    type: "Lunch",
    time: "12:45",
    date: todayDateStr,
    description: "Cooked quinoa bowl with grilled chicken breast and tender steamed carrots.",
    items: [
      {
        foodId: "food-chicken-breast",
        name: "Grilled Chicken Breast (Skinless)",
        quantity: 150,
        unit: "g",
        calories: 248,
        protein: 46.5,
        carbs: 0.0,
        fat: 5.4,
        fiber: 0.0,
        isEstimated: false,
      },
      {
        foodId: "food-quinoa",
        name: "Cooked Quinoa",
        quantity: 120,
        unit: "g",
        calories: 144,
        protein: 5.3,
        carbs: 25.6,
        fat: 2.3,
        fiber: 3.4,
        isEstimated: false,
      },
      {
        foodId: "food-steamed-carrots",
        name: "Tender Steamed Carrots",
        quantity: 100,
        unit: "g",
        calories: 35,
        protein: 0.8,
        carbs: 8.2,
        fat: 0.2,
        fiber: 2.8,
        isEstimated: false,
      },
      {
        foodId: "food-olive-oil",
        name: "Extra Virgin Olive Oil",
        quantity: 1,
        unit: "tbsp",
        calories: 119,
        protein: 0.0,
        carbs: 0.0,
        fat: 13.5,
        fiber: 0.0,
        isEstimated: false,
      },
    ],
    totalCalories: 546,
    totalProtein: 52.6,
    totalCarbs: 33.8,
    totalFat: 21.4,
    totalFiber: 6.2,
    preMealSymptomSeverity: 2,
    postMealSymptomSeverity: 4,
    preMealAcousticRate: 5.1,
    postMealAcousticRate: 18.2,
    preMealHeartRate: 73,
    postMealHeartRate: 80,
    simulated: true,
  },
  {
    id: "meal-3",
    type: "Snack",
    time: "16:15",
    date: todayDateStr,
    description: "Ripe banana with natural peanut butter.",
    items: [
      {
        foodId: "food-banana",
        name: "Ripe Banana",
        quantity: 1,
        unit: "piece",
        calories: 105,
        protein: 1.3,
        carbs: 27.0,
        fat: 0.3,
        fiber: 3.1,
        isEstimated: false,
      },
      {
        foodId: "food-peanut-butter",
        name: "Natural Smooth Peanut Butter",
        quantity: 1,
        unit: "tbsp",
        calories: 94,
        protein: 4.0,
        carbs: 3.1,
        fat: 8.0,
        fiber: 1.0,
        isEstimated: false,
      },
    ],
    totalCalories: 199,
    totalProtein: 5.3,
    totalCarbs: 30.1,
    totalFat: 8.3,
    totalFiber: 4.1,
    preMealSymptomSeverity: 1,
    postMealSymptomSeverity: 2,
    preMealAcousticRate: 5.4,
    postMealAcousticRate: 8.6,
    preMealHeartRate: 70,
    postMealHeartRate: 73,
    simulated: true,
  },
];

const INITIAL_BOWEL_EVENTS: BowelEvent[] = [
  {
    id: "bow-1",
    time: "09:10",
    date: todayDateStr,
    stoolForm: 4,
    stoolDescription: "Type 4: Like a sausage or snake, smooth and soft (Normal)",
    urgency: "Mild",
    discomfort: "None",
    notes: "Normal transit sensation ~55 min post breakfast.",
    simulated: true,
  },
  {
    id: "bow-2",
    time: "17:20",
    date: todayDateStr,
    stoolForm: 3,
    stoolDescription: "Type 3: Like a sausage with cracks on its surface (Normal)",
    urgency: "None",
    discomfort: "Mild",
    notes: "Mild evacuation effort, no sharp pain.",
    simulated: true,
  },
];

// Include Breakfast, Lunch, and Dinner in GutPatch sessions
const INITIAL_GUTPATCH_SESSIONS: GutPatchSession[] = [
  {
    id: "session-bfast",
    sessionName: "Morning Postprandial Window (Breakfast)",
    associatedMeal: "Breakfast",
    timePeriod: "Morning",
    startTime: "08:30",
    endTime: "10:00",
    date: todayDateStr,
    linkedMealId: "meal-1",
    status: "Completed",
    acousticEventRate: 15.2,
    abdominalExpansionTrend: [
      { minute: 0, expansion: 0.1, soundRate: 4.8 },
      { minute: 15, expansion: 0.3, soundRate: 7.2 },
      { minute: 30, expansion: 0.8, soundRate: 14.1 },
      { minute: 45, expansion: 1.2, soundRate: 15.2 },
      { minute: 60, expansion: 1.0, soundRate: 13.4 },
      { minute: 75, expansion: 0.6, soundRate: 10.1 },
      { minute: 90, expansion: 0.2, soundRate: 6.5 },
    ],
    signalQuality: "Optimal",
    movementArtifact: false,
    preMealAcousticRate: 4.8,
    postMealAcousticRate: 15.2,
    preMealSymptomSeverity: 1,
    postMealSymptomSeverity: 2,
    preMealHeartRate: 71,
    postMealHeartRate: 75,
    notes: "Prompt gastrocolic reflex recorded following high-fiber breakfast.",
    simulated: true,
  },
  {
    id: "session-lunch",
    sessionName: "Postprandial Acoustic Transit Window (Lunch)",
    associatedMeal: "Lunch",
    timePeriod: "Afternoon",
    startTime: "12:30",
    endTime: "14:30",
    date: todayDateStr,
    linkedMealId: "meal-2",
    status: "Completed",
    acousticEventRate: 18.2,
    abdominalExpansionTrend: [
      { minute: 0, expansion: 0.1, soundRate: 5.1 },
      { minute: 15, expansion: 0.4, soundRate: 7.8 },
      { minute: 30, expansion: 1.2, soundRate: 15.6 },
      { minute: 45, expansion: 1.8, soundRate: 18.2 },
      { minute: 60, expansion: 1.6, soundRate: 16.0 },
      { minute: 75, expansion: 1.1, soundRate: 12.3 },
      { minute: 90, expansion: 0.8, soundRate: 9.4 },
      { minute: 105, expansion: 0.5, soundRate: 7.0 },
      { minute: 120, expansion: 0.3, soundRate: 6.2 },
    ],
    signalQuality: "Optimal",
    movementArtifact: false,
    preMealAcousticRate: 5.1,
    postMealAcousticRate: 18.2,
    preMealSymptomSeverity: 2,
    postMealSymptomSeverity: 4,
    preMealHeartRate: 73,
    postMealHeartRate: 80,
    notes: "Normal gastrocolic acoustic response observed following 12:45 meal.",
    simulated: true,
  },
  {
    id: "session-snack",
    sessionName: "Afternoon Light Snack Window (Snack)",
    associatedMeal: "Snack",
    timePeriod: "Afternoon",
    startTime: "16:15",
    endTime: "17:00",
    date: todayDateStr,
    linkedMealId: "meal-3",
    status: "Completed",
    acousticEventRate: 8.6,
    abdominalExpansionTrend: [
      { minute: 0, expansion: 0.1, soundRate: 5.4 },
      { minute: 15, expansion: 0.2, soundRate: 6.9 },
      { minute: 30, expansion: 0.4, soundRate: 8.6 },
      { minute: 45, expansion: 0.3, soundRate: 7.2 },
    ],
    signalQuality: "Optimal",
    movementArtifact: false,
    preMealAcousticRate: 5.4,
    postMealAcousticRate: 8.6,
    preMealSymptomSeverity: 1,
    postMealSymptomSeverity: 2,
    preMealHeartRate: 70,
    postMealHeartRate: 73,
    notes: "Mild acoustic motility surge observed after low-FODMAP fruit snack.",
    simulated: true,
  },
  {
    id: "session-dinner",
    sessionName: "Evening Motility Surveillance (Dinner)",
    associatedMeal: "Dinner",
    timePeriod: "Evening",
    startTime: "18:00",
    date: todayDateStr,
    status: "Active",
    acousticEventRate: 9.1,
    abdominalExpansionTrend: [
      { minute: 0, expansion: 0.2, soundRate: 6.8 },
      { minute: 15, expansion: 0.3, soundRate: 7.4 },
      { minute: 30, expansion: 0.5, soundRate: 9.1 },
      { minute: 45, expansion: 0.6, soundRate: 8.6 },
    ],
    signalQuality: "Good",
    movementArtifact: false,
    preMealAcousticRate: 6.8,
    postMealAcousticRate: 9.1,
    preMealSymptomSeverity: 1,
    postMealSymptomSeverity: 2,
    preMealHeartRate: 70,
    postMealHeartRate: 74,
    notes: "Live continuous monitoring in progress.",
    simulated: true,
  },
];

const INITIAL_DEVICES: DeviceInfo[] = [
  {
    id: "dev-smartband",
    name: "GutHub SmartBand v2",
    type: "SmartBand",
    connected: true,
    battery: 88,
    lastUpdate: "Just now (1s ago)",
    firmware: "v2.4.1-rc3",
    dataSource: "Simulated BLE Stream",
    signalStrengthDbm: -58,
  },
  {
    id: "dev-gutpatch",
    name: "GutPatch Acoustic & Bio-Impedance Sensor",
    type: "GutPatch",
    connected: true,
    battery: 76,
    lastUpdate: "Just now (3s ago)",
    firmware: "v3.1.0-med",
    dataSource: "Simulated BLE Stream",
    signalStrengthDbm: -62,
  },
  {
    id: "dev-smartbox",
    name: "Smart Medication PillBox",
    type: "Smart Medication Box",
    connected: true,
    battery: 92,
    lastUpdate: "35m ago",
    firmware: "v1.8.4",
    dataSource: "Demo Virtual Sensor",
    signalStrengthDbm: -71,
  },
];

const INITIAL_INSIGHTS: PersonalInsight[] = [
  {
    id: "ins-1",
    title: "Postprandial Gastrocolic Motility Response",
    category: "Motility Observation",
    summary: "Bowel sound acoustic activity increased by 256% within 30-45 minutes after lunch (12:45).",
    evidence: "Acoustic rate increased from 5.1 events/min (pre-meal) to peak 18.2 events/min during the lunch GutPatch session.",
    confidence: "Repeated Observation",
    timestamp: "Today at 14:35",
    disclaimer: "Exploratory demonstration insight based on bio-acoustic sensor modeling. Not a medical diagnosis or direct measurement of transit velocity.",
  },
  {
    id: "ins-2",
    title: "Bloating Severity Linked to Rapid Post-Meal Expansion",
    category: "Meal Transit Observation",
    summary: "Recorded bloating score (4/10) matched peak abdominal strain expansion (+1.8 mm equivalent) at 13:30.",
    evidence: "Abdominal strain curve showed maximum expansion 45 minutes post-lunch, aligning with user-reported bloating timestamp.",
    confidence: "Preliminary Pattern",
    timestamp: "Today at 15:00",
    disclaimer: "Correlation is exploratory. Individual digestive dynamics vary with posture, hydration, and activity.",
  },
  {
    id: "ins-3",
    title: "High Medication Adherence Window",
    category: "Medication Correlate",
    summary: "On-time adherence for morning osmotic laxative was confirmed within 5 minutes of scheduled time (08:05 vs 08:00).",
    evidence: "Smart Medication Box lid sensor triggered at 08:05; confirmed by patient intake log.",
    confidence: "Repeated Observation",
    timestamp: "Today at 08:10",
    disclaimer: "Adherence detection is sensor-assisted and subject to patient verification.",
  },
];

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(`guthub_${key}`);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
    }
    return defaultValue;
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`guthub_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing key ${key} to localStorage:`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`guthub_${key}`);
    } catch (e) {
      console.warn(`Error removing key ${key}:`, e);
    }
  },

  // Initialize demo data if not yet present and migrate legacy schema
  initDemoData(): void {
    if (!localStorage.getItem("guthub_patient_profile")) {
      this.set("patient_profile", INITIAL_PROFILE);
    }
    if (!localStorage.getItem("guthub_measure")) {
      this.set("measure", INITIAL_MEASUREMENT);
    }
    if (!localStorage.getItem("guthub_symptoms")) {
      this.set("symptoms", INITIAL_SYMPTOMS);
    }
    if (!localStorage.getItem("guthub_medications")) {
      this.set("medications", INITIAL_MEDICATIONS);
    }
    if (!localStorage.getItem("guthub_meals")) {
      this.set("meals", INITIAL_MEALS);
    } else {
      // Defensive schema migration for meals
      try {
        const storedMeals = JSON.parse(localStorage.getItem("guthub_meals") || "[]");
        if (Array.isArray(storedMeals) && storedMeals.some((m) => m.preMealAcousticRate === undefined)) {
          this.set("meals", INITIAL_MEALS);
        }
      } catch (e) {
        this.set("meals", INITIAL_MEALS);
      }
    }
    if (!localStorage.getItem("guthub_bowel")) {
      this.set("bowel", INITIAL_BOWEL_EVENTS);
    }
    if (!localStorage.getItem("guthub_gpatch")) {
      this.set("gpatch", INITIAL_GUTPATCH_SESSIONS);
    } else {
      // Defensive schema migration for GutPatch sessions:
      // If records were created before associatedMeal or preMealAcousticRate was introduced,
      // update or heal them so Pre vs Post meal comparison charts never render blank.
      try {
        const storedSessions = JSON.parse(localStorage.getItem("guthub_gpatch") || "[]");
        const needsRepair =
          !Array.isArray(storedSessions) ||
          storedSessions.length < 3 ||
          storedSessions.some(
            (s) =>
              !s.associatedMeal ||
              s.preMealAcousticRate === undefined ||
              s.postMealAcousticRate === undefined
          );
        if (needsRepair) {
          this.set("gpatch", INITIAL_GUTPATCH_SESSIONS);
        }
      } catch (e) {
        this.set("gpatch", INITIAL_GUTPATCH_SESSIONS);
      }
    }
    if (!localStorage.getItem("guthub_devices")) {
      this.set("devices", INITIAL_DEVICES);
    }
    if (!localStorage.getItem("guthub_insights")) {
      this.set("insights", INITIAL_INSIGHTS);
    }
  },

  resetDemoData(): void {
    this.set("patient_profile", INITIAL_PROFILE);
    this.set("measure", INITIAL_MEASUREMENT);
    this.set("symptoms", INITIAL_SYMPTOMS);
    this.set("medications", INITIAL_MEDICATIONS);
    this.set("meals", INITIAL_MEALS);
    this.set("bowel", INITIAL_BOWEL_EVENTS);
    this.set("gpatch", INITIAL_GUTPATCH_SESSIONS);
    this.set("devices", INITIAL_DEVICES);
    this.set("insights", INITIAL_INSIGHTS);
  },
};

// Initialize right away
storage.initDemoData();
