// src/pages/MealsBowel.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import {
  Utensils,
  Clock,
  CheckCircle2,
  Trash2,
  Activity,
  Plus,
  Search,
  Sparkles,
  Scale,
  Flame,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  BarChart2,
} from "lucide-react";
import { Meal, BowelEvent, PatientProfile, MealFoodItem, FoodItem } from "../types";
import { storage } from "../services/storage";
import {
  NUTRITION_DATABASE,
  calculateFoodItemNutrition,
  calculatePersonalizedTargets,
  getNutritionalSuggestions,
  validateFoodQuantity,
} from "../services/nutritionDb";

const BRISTOL_SCALE = [
  {
    type: 1,
    title: "Type 1: Separate Hard Lumps",
    desc: "Hard pellets, difficult to evacuate. Indicates slow colonic transit.",
    category: "Constipation",
    badgeColor: "bg-amber-muted/15 text-amber-muted border-amber-muted/30",
  },
  {
    type: 2,
    title: "Type 2: Lumpy Sausage",
    desc: "Sausage-shaped with visible lumps. Indicates mild constipation.",
    category: "Constipation",
    badgeColor: "bg-amber-muted/15 text-amber-muted border-amber-muted/30",
  },
  {
    type: 3,
    title: "Type 3: Sausage with Surface Cracks",
    desc: "Like a sausage with cracks on surface. Normal physiological transit.",
    category: "Normal",
    badgeColor: "bg-teal-light text-teal-dark border-teal-japan/20",
  },
  {
    type: 4,
    title: "Type 4: Smooth & Soft Snake",
    desc: "Smooth and soft consistency. Optimal gastrointestinal form.",
    category: "Optimal",
    badgeColor: "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]",
  },
  {
    type: 5,
    title: "Type 5: Soft Blobs with Clear Edges",
    desc: "Passes easily, lacks dietary fiber. Fast colonic transit.",
    category: "Mild Urgency",
    badgeColor: "bg-mist-blue text-navy-deep border-border-soft",
  },
  {
    type: 6,
    title: "Type 6: Fluffy Pieces, Ragged Edges",
    desc: "Mushy stool with rapid transit.",
    category: "Mild Diarrhea",
    badgeColor: "bg-coral-refined/10 text-coral-refined border-coral-refined/20",
  },
  {
    type: 7,
    title: "Type 7: Watery, No Solid Pieces",
    desc: "Entirely liquid stool with severe transit acceleration.",
    category: "Severe Diarrhea",
    badgeColor: "bg-coral-refined/20 text-coral-refined border-coral-refined/40 font-bold",
  },
];

const MealsBowel: React.FC = () => {
  const [profile] = useState<PatientProfile>(() =>
    storage.get<PatientProfile>("patient_profile", {
      fullName: "Alex Morgan",
      age: 34,
      dateOfBirth: "1992-04-18",
      sex: "Female",
      occupation: "Software Designer",
      weightKg: 64,
      heightCm: 168,
      address: "742 Evergreen Terrace",
      activityLevel: "Lightly Active",
      dietaryRestrictions: ["Lactose-free", "Low-FODMAP"],
      onboardingCompleted: true,
    })
  );

  const [meals, setMeals] = useState<Meal[]>(() =>
    storage.get<Meal[]>("meals", [])
  );
  const [bowelEvents, setBowelEvents] = useState<BowelEvent[]>(() =>
    storage.get<BowelEvent[]>("bowel", [])
  );

  // Meal Form State
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [mealTime, setMealTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [mealDesc, setMealDesc] = useState<string>("");
  const [currentMealItems, setCurrentMealItems] = useState<MealFoodItem[]>([]);
  const [preMealSeverity, setPreMealSeverity] = useState<number>(1);
  const [postMealSeverity, setPostMealSeverity] = useState<number>(3);
  const [mealSuccess, setMealSuccess] = useState<string | null>(null);

  // Food Item Selector State
  const [searchFoodQuery, setSearchFoodQuery] = useState<string>("");
  const [selectedFoodId, setSelectedFoodId] = useState<string>(NUTRITION_DATABASE[0].id);
  const [quantityInput, setQuantityInput] = useState<string>("100");
  const [foodUnit, setFoodUnit] = useState<string>("g");

  // Bowel Form State
  const [selectedBristol, setSelectedBristol] = useState<number>(4);
  const [bowelTime, setBowelTime] = useState<string>("17:30");
  const [urgency, setUrgency] = useState<"None" | "Mild" | "Moderate" | "Urgent">("None");
  const [discomfort, setDiscomfort] = useState<"None" | "Mild" | "Moderate" | "Severe">("None");
  const [bowelNotes, setBowelNotes] = useState<string>("");
  const [bowelSuccess, setBowelSuccess] = useState<string | null>(null);

  // Active Selected Food Item
  const activeFoodObject = useMemo(() => {
    return NUTRITION_DATABASE.find((f) => f.id === selectedFoodId) || NUTRITION_DATABASE[0];
  }, [selectedFoodId]);

  // Validation of entered quantity
  const quantityValidation = useMemo(() => {
    return validateFoodQuantity(quantityInput, foodUnit);
  }, [quantityInput, foodUnit]);

  // Live Prospective Nutrition Preview (Automatically updates dynamically as user changes food, qty, or unit)
  const livePreviewNutrition = useMemo(() => {
    const parsedQty = parseFloat(quantityInput);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      };
    }
    return calculateFoodItemNutrition(activeFoodObject, parsedQty, foodUnit);
  }, [activeFoodObject, quantityInput, foodUnit]);

  // Personalized Targets
  const targets = useMemo(() => calculatePersonalizedTargets(profile), [profile]);

  // Today's Consumed Nutrition
  const todayConsumed = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    meals.forEach((m) => {
      if (m.totalCalories) calories += m.totalCalories;
      if (m.totalProtein) protein += m.totalProtein;
      if (m.totalCarbs) carbs += m.totalCarbs;
      if (m.totalFat) fat += m.totalFat;
      if (m.totalFiber) fiber += m.totalFiber;
    });

    return {
      calories,
      protein: parseFloat(protein.toFixed(1)),
      carbs: parseFloat(carbs.toFixed(1)),
      fat: parseFloat(fat.toFixed(1)),
      fiber: parseFloat(fiber.toFixed(1)),
    };
  }, [meals]);

  const caloriesRemaining = Math.max(0, targets.targetCalories - todayConsumed.calories);
  const proteinRemaining = Math.max(0, targets.targetProteinGrams - todayConsumed.protein);
  const calPercent = Math.min(100, Math.round((todayConsumed.calories / targets.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((todayConsumed.protein / targets.targetProteinGrams) * 100));

  // Smart Food Suggestions based on remaining calories/protein
  const suggestions = useMemo(
    () => getNutritionalSuggestions(caloriesRemaining, proteinRemaining, profile?.dietaryRestrictions),
    [caloriesRemaining, proteinRemaining, profile]
  );

  // Current Meal Running Totals
  const currentMealTotals = useMemo(() => {
    let cal = 0;
    let pro = 0;
    let carb = 0;
    let ft = 0;
    let fib = 0;
    currentMealItems.forEach((item) => {
      cal += item.calories;
      pro += item.protein;
      carb += item.carbs;
      ft += item.fat;
      fib += item.fiber;
    });
    return {
      calories: cal,
      protein: parseFloat(pro.toFixed(1)),
      carbs: parseFloat(carb.toFixed(1)),
      fat: parseFloat(ft.toFixed(1)),
      fiber: parseFloat(fib.toFixed(1)),
    };
  }, [currentMealItems]);

  // Filtered food list for search picker
  const filteredFoods = useMemo(() => {
    if (!searchFoodQuery.trim()) return NUTRITION_DATABASE;
    const q = searchFoodQuery.toLowerCase();
    return NUTRITION_DATABASE.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchFoodQuery]);

  const handleAddFoodItem = () => {
    if (!quantityValidation.isValid) return;
    const parsedQty = parseFloat(quantityInput);
    const computed = calculateFoodItemNutrition(activeFoodObject, parsedQty, foodUnit);
    setCurrentMealItems([...currentMealItems, computed]);
  };

  const handleRemoveFoodItem = (index: number) => {
    setCurrentMealItems(currentMealItems.filter((_, i) => i !== index));
  };

  // Quick Preset Loader
  const handleLoadPreset = (presetType: "breakfast" | "lunch" | "snack") => {
    if (presetType === "breakfast") {
      setMealType("Breakfast");
      const oats = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-oats")!, 60, "g");
      const blueberries = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-blueberries")!, 50, "g");
      const chia = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-chia-seeds")!, 1, "tbsp");
      const milk = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-almond-milk")!, 200, "ml");
      setCurrentMealItems([oats, blueberries, chia, milk]);
      setMealDesc("Rolled oats with blueberries, chia seeds, and unsweetened almond milk.");
      setPreMealSeverity(1);
      setPostMealSeverity(3);
    } else if (presetType === "lunch") {
      setMealType("Lunch");
      const chicken = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-chicken-breast")!, 150, "g");
      const quinoa = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-quinoa")!, 120, "g");
      const carrots = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-steamed-carrots")!, 100, "g");
      const oil = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-olive-oil")!, 1, "tbsp");
      setCurrentMealItems([chicken, quinoa, carrots, oil]);
      setMealDesc("Quinoa bowl with grilled chicken, tender steamed carrots, and extra virgin olive oil.");
      setPreMealSeverity(2);
      setPostMealSeverity(4);
    } else {
      setMealType("Snack");
      const banana = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-banana")!, 1, "piece");
      const pb = calculateFoodItemNutrition(NUTRITION_DATABASE.find((f) => f.id === "food-peanut-butter")!, 1, "tbsp");
      setCurrentMealItems([banana, pb]);
      setMealDesc("Ripe banana with creamy natural peanut butter.");
      setPreMealSeverity(1);
      setPostMealSeverity(2);
    }
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();

    let autoDesc = mealDesc.trim();
    if (!autoDesc && currentMealItems.length > 0) {
      autoDesc = currentMealItems.map((i) => `${i.name} (${i.quantity}${i.unit})`).join(", ");
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const newMeal: Meal = {
      id: "meal-" + Date.now(),
      type: mealType,
      time: mealTime,
      date: todayStr,
      description: autoDesc || undefined,
      items: currentMealItems.length > 0 ? currentMealItems : undefined,
      totalCalories: currentMealTotals.calories > 0 ? currentMealTotals.calories : undefined,
      totalProtein: currentMealTotals.protein > 0 ? currentMealTotals.protein : undefined,
      totalCarbs: currentMealTotals.carbs > 0 ? currentMealTotals.carbs : undefined,
      totalFat: currentMealTotals.fat > 0 ? currentMealTotals.fat : undefined,
      totalFiber: currentMealTotals.fiber > 0 ? currentMealTotals.fiber : undefined,
      preMealSymptomSeverity: preMealSeverity,
      postMealSymptomSeverity: postMealSeverity,
      preMealAcousticRate: mealType === "Breakfast" ? 4.8 : mealType === "Lunch" ? 5.1 : 6.8,
      postMealAcousticRate: mealType === "Breakfast" ? 15.2 : mealType === "Lunch" ? 18.2 : 9.1,
      simulated: true,
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    storage.set("meals", updated);

    // Save corresponding pre & post symptoms into symptom ledger for cross-module integration
    const existingSymptoms = storage.get("symptoms", []);
    const preSymptom = {
      id: "sym-pre-" + Date.now(),
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      date: todayStr,
      type: "Bloating",
      severity: preMealSeverity,
      notes: `Pre-meal baseline for ${mealType} @ ${mealTime}`,
      associatedMeal: `${mealType} @ ${mealTime}`,
      linkedMealId: newMeal.id,
      timingRelativeToMeal: "pre-meal" as const,
      simulated: true,
    };
    const postSymptom = {
      id: "sym-post-" + Date.now(),
      timestamp: new Date().toISOString(),
      date: todayStr,
      type: "Bloating",
      severity: postMealSeverity,
      notes: `Postprandial evaluation for ${mealType} @ ${mealTime}`,
      associatedMeal: `${mealType} @ ${mealTime}`,
      linkedMealId: newMeal.id,
      timingRelativeToMeal: "post-meal" as const,
      simulated: true,
    };
    storage.set("symptoms", [postSymptom, preSymptom, ...existingSymptoms]);

    setMealDesc("");
    setCurrentMealItems([]);
    setMealSuccess(`Meal entry saved (${mealType} @ ${mealTime}). Total: ${newMeal.totalCalories || 0} kcal, ${newMeal.totalProtein || 0}g protein.`);
    setTimeout(() => setMealSuccess(null), 4500);
  };

  const handleSaveBowel = (e: React.FormEvent) => {
    e.preventDefault();
    const bristolInfo = BRISTOL_SCALE.find((b) => b.type === selectedBristol);
    const newBowel: BowelEvent = {
      id: "bow-" + Date.now(),
      time: bowelTime,
      date: new Date().toISOString().split("T")[0],
      stoolForm: selectedBristol,
      stoolDescription: bristolInfo ? bristolInfo.title : `Type ${selectedBristol}`,
      urgency,
      discomfort,
      notes: bowelNotes.trim() || undefined,
      simulated: true,
    };
    const updated = [newBowel, ...bowelEvents];
    setBowelEvents(updated);
    storage.set("bowel", updated);

    setBowelNotes("");
    setBowelSuccess(`Bowel event recorded (Bristol Type ${selectedBristol} @ ${bowelTime}).`);
    setTimeout(() => setBowelSuccess(null), 4000);
  };

  const handleDeleteMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    storage.set("meals", updated);
  };

  const handleDeleteBowel = (id: string) => {
    const updated = bowelEvents.filter((b) => b.id !== id);
    setBowelEvents(updated);
    storage.set("bowel", updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border-soft shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-japan tracking-wider uppercase bg-teal-light px-2 py-0.5 rounded border border-teal-japan/20">
              Dietary & Evacuation
            </span>
            <span className="text-xs text-slate-muted">Smart Nutrition Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-deep font-display">
            Meals & Bowel Movement Intelligence
          </h1>
          <p className="text-xs text-slate-muted">
            Quantity-based food logging with live proportional macronutrient calculations and Bristol Stool records
          </p>
        </div>

        {/* Link to Pre- vs. Post-Meal Gastrointestinal Comparison */}
        <Link
          to="/comparison"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-light hover:bg-[#DDF0EB] text-teal-dark border border-teal-japan/30 text-xs font-semibold transition-colors shadow-xs"
        >
          <BarChart2 size={14} className="text-teal-japan" />
          <span>Pre vs Post-Meal Analysis</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 1. PERSONALIZED DAILY NUTRITION REQUIREMENTS & PROGRESS CARD */}
      <Card
        title="Personalized Daily Nutrition Requirements & Progress"
        subtitle={`Target calibrated for ${profile.fullName} (${profile.weightKg} kg • ${profile.activityLevel})`}
      >
        <div className="space-y-5">
          {/* Dual Progress Visualizer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calories Card */}
            <div className="p-4 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-amber-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-deep">
                    Daily Calories (Energy)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    calPercent >= 80 && calPercent <= 110
                      ? "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]"
                      : calPercent > 110
                      ? "bg-[#FFF0EF] text-coral-refined border-coral-refined/30"
                      : "bg-teal-light text-teal-dark border-teal-japan/30"
                  }`}
                >
                  {calPercent >= 80 && calPercent <= 110
                    ? "Target Reached"
                    : calPercent > 110
                    ? "Surplus"
                    : `${caloriesRemaining} kcal remaining`}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-navy-deep font-display">
                    {todayConsumed.calories}
                  </span>
                  <span className="text-xs text-slate-muted"> / {targets.targetCalories} kcal</span>
                </div>
                <span className="text-sm font-bold text-navy-deep">{calPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#D5DFDC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-japan rounded-full transition-all duration-500"
                  style={{ width: `${calPercent}%` }}
                />
              </div>

              <p className="text-[10.5px] text-slate-muted">
                Basal BMR: <strong>{targets.bmr} kcal</strong> • TDEE Multiplier:{" "}
                <strong>
                  {profile.activityLevel === "Sedentary"
                    ? "1.2"
                    : profile.activityLevel === "Lightly Active"
                    ? "1.375"
                    : "1.55"}
                  x
                </strong>
              </p>
            </div>

            {/* Protein Card */}
            <div className="p-4 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-forest-green" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-deep">
                    Daily Protein (Mucosal Repair)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    proteinPercent >= 85
                      ? "bg-[#EBF7F2] text-forest-green border-[#C3E8DC]"
                      : "bg-teal-light text-teal-dark border-teal-japan/30"
                  }`}
                >
                  {proteinPercent >= 100
                    ? "Met Goal"
                    : `${proteinRemaining}g remaining`}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-forest-green font-display">
                    {todayConsumed.protein}
                  </span>
                  <span className="text-xs text-slate-muted">
                    {" "}
                    / {targets.targetProteinGrams} g
                  </span>
                </div>
                <span className="text-sm font-bold text-forest-green">{proteinPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#D5DFDC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-green rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>

              <p className="text-[10.5px] text-slate-muted">
                Calibrated at <strong>1.1 g/kg</strong> of body weight ({profile.weightKg} kg)
              </p>
            </div>
          </div>

          {/* Contextual Smart Recommendations */}
          <div className="p-4 rounded-xl bg-surface border border-teal-japan/25 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-deep">
              <Sparkles size={14} className="text-teal-japan" />
              <span>Personalized Digestive Food Suggestions</span>
              <span className="text-[10px] font-normal text-slate-muted">
                (Filtered for {profile.dietaryRestrictions.join(", ")})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {suggestions.map(({ food, reason }) => (
                <div
                  key={food.id}
                  className="p-2.5 rounded-lg bg-bg-ivory border border-border-soft text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy-deep">{food.name}</span>
                    <span className="text-[10px] text-teal-japan font-bold">
                      {food.calories} kcal
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-muted leading-snug">{reason}</p>
                  <div className="text-[9.5px] text-forest-green font-medium">
                    Pro: {food.protein}g • Fib: {food.fiber}g per {food.servingSize}{food.servingUnit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. QUANTITY-BASED MEAL BUILDER & BRISTOL STOOL FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meal Logging with Multi-Item Food Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            title="Log Meal Consumption"
            subtitle="Search foods, customize portion units, and compute real-time macros"
            action={
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-muted uppercase font-semibold">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("breakfast")}
                  className="px-2 py-0.5 rounded text-[10.5px] bg-bg-ivory border border-border-soft text-navy-deep hover:bg-teal-light hover:text-teal-dark font-medium transition-colors"
                >
                  Oats
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("lunch")}
                  className="px-2 py-0.5 rounded text-[10.5px] bg-bg-ivory border border-border-soft text-navy-deep hover:bg-teal-light hover:text-teal-dark font-medium transition-colors"
                >
                  Quinoa
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("snack")}
                  className="px-2 py-0.5 rounded text-[10.5px] bg-bg-ivory border border-border-soft text-navy-deep hover:bg-teal-light hover:text-teal-dark font-medium transition-colors"
                >
                  Banana
                </button>
              </div>
            }
          >
            {mealSuccess && (
              <div className="mb-4 bg-[#EBF7F2] border border-[#C3E8DC] p-3 rounded-lg text-xs text-navy-deep flex items-center gap-2">
                <CheckCircle2 size={15} className="text-forest-green flex-shrink-0" />
                <span className="font-medium">{mealSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveMeal} className="space-y-4">
              {/* Meal Type & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Meal Category *
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan font-medium"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack / Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Meal Time *
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-muted" />
                    <input
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Quantity-Based Food Item Selector Sub-Panel with Automatic Live Calculations */}
              <div className="p-3.5 rounded-xl bg-bg-ivory/80 border border-border-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-deep">
                    Add Items to Meal (Portion Calculator)
                  </span>
                  <span className="text-[10px] text-teal-japan font-medium">
                    {NUTRITION_DATABASE.length} reference foods
                  </span>
                </div>

                {/* Food search and select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-muted" />
                    <input
                      type="text"
                      placeholder="Search food database..."
                      value={searchFoodQuery}
                      onChange={(e) => setSearchFoodQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-navy-deep focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedFoodId}
                    onChange={(e) => {
                      setSelectedFoodId(e.target.value);
                      const f = NUTRITION_DATABASE.find((item) => item.id === e.target.value);
                      if (f) {
                        setFoodUnit(f.servingUnit);
                        setQuantityInput(String(f.servingSize));
                      }
                    }}
                    className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none font-medium"
                  >
                    {filteredFoods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal / {f.servingSize}{f.servingUnit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity and Unit controls with Validation */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1/3">
                      <label className="block text-[10px] uppercase font-semibold text-slate-muted mb-0.5">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        placeholder="e.g. 150"
                        className={`w-full rounded-lg border p-1.5 bg-surface text-xs text-navy-deep focus:outline-none ${
                          !quantityValidation.isValid
                            ? "border-coral-refined ring-1 ring-coral-refined/30"
                            : "border-border-soft focus:border-teal-japan"
                        }`}
                        required
                      />
                    </div>

                    <div className="w-1/3">
                      <label className="block text-[10px] uppercase font-semibold text-slate-muted mb-0.5">
                        Portion Unit *
                      </label>
                      <select
                        value={foodUnit}
                        onChange={(e) => setFoodUnit(e.target.value)}
                        className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none"
                      >
                        <option value="g">grams (g)</option>
                        <option value="ml">milliliters (ml)</option>
                        <option value="serving">serving(s)</option>
                        <option value="cup">cup(s)</option>
                        <option value="tbsp">tablespoon (tbsp)</option>
                        <option value="piece">piece(s)</option>
                        <option value="slice">slice(s)</option>
                      </select>
                    </div>

                    <div className="w-1/3 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddFoodItem}
                        disabled={!quantityValidation.isValid}
                        className={`w-full py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-colors ${
                          quantityValidation.isValid
                            ? "bg-teal-japan hover:bg-teal-dark text-white cursor-pointer"
                            : "bg-[#D5DFDC] text-slate-muted cursor-not-allowed"
                        }`}
                      >
                        <Plus size={13} /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Validation error / warning messaging */}
                  {!quantityValidation.isValid && quantityValidation.errorMessage && (
                    <div className="text-[11px] text-coral-refined flex items-center gap-1 font-medium">
                      <AlertCircle size={12} />
                      <span>{quantityValidation.errorMessage}</span>
                    </div>
                  )}

                  {quantityValidation.isValid && quantityValidation.warningMessage && (
                    <div className="text-[11px] text-amber-muted flex items-center gap-1 font-medium">
                      <Info size={12} />
                      <span>{quantityValidation.warningMessage}</span>
                    </div>
                  )}
                </div>

                {/* AUTOMATIC PROPORTIONAL CALCULATION PREVIEW BOX */}
                <div className="p-2.5 rounded-lg bg-surface border border-teal-japan/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-navy-deep">
                      Live Calculated Values: <strong className="text-teal-japan">{activeFoodObject.name}</strong>
                    </span>
                    <span className="text-[10px] text-slate-muted font-medium">
                      for {quantityInput || 0} {foodUnit}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-1.5 rounded bg-bg-ivory border border-border-soft">
                      <div className="text-xs font-bold text-navy-deep">{livePreviewNutrition.calories}</div>
                      <div className="text-[9px] uppercase font-semibold text-slate-muted">Calories (kcal)</div>
                    </div>
                    <div className="p-1.5 rounded bg-[#EBF7F2] border border-[#C3E8DC]">
                      <div className="text-xs font-bold text-forest-green">{livePreviewNutrition.protein}g</div>
                      <div className="text-[9px] uppercase font-semibold text-forest-green">Protein</div>
                    </div>
                    <div className="p-1.5 rounded bg-bg-ivory border border-border-soft">
                      <div className="text-xs font-bold text-navy-deep">{livePreviewNutrition.carbs}g</div>
                      <div className="text-[9px] uppercase font-semibold text-slate-muted">Carbs</div>
                    </div>
                    <div className="p-1.5 rounded bg-bg-ivory border border-border-soft">
                      <div className="text-xs font-bold text-navy-deep">{livePreviewNutrition.fiber}g</div>
                      <div className="text-[9px] uppercase font-semibold text-slate-muted">Fiber</div>
                    </div>
                  </div>
                </div>

                {/* Added Items List for This Meal */}
                {currentMealItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border-soft">
                    <div className="text-[10px] font-semibold text-slate-muted uppercase">
                      Current Meal Composition ({currentMealItems.length} item{currentMealItems.length > 1 ? "s" : ""}):
                    </div>
                    {currentMealItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-surface border border-border-soft/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-navy-deep">{item.name}</span>
                          <span className="text-slate-muted text-[11px] ml-1">
                            ({item.quantity} {item.unit})
                          </span>
                          <div className="text-[10px] text-teal-dark font-medium">
                            {item.calories} kcal • {item.protein}g protein • {item.fiber}g fiber
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(idx)}
                          className="text-slate-muted/50 hover:text-coral-refined p-1"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Running Subtotal */}
                    <div className="p-2.5 rounded-lg bg-teal-light/40 border border-teal-japan/30 flex items-center justify-between text-xs font-bold text-navy-deep">
                      <span>Meal Total Intake:</span>
                      <span className="text-teal-japan">
                        {currentMealTotals.calories} kcal • {currentMealTotals.protein}g protein • {currentMealTotals.fiber}g fiber
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre vs Post Meal Gastrointestinal Discomfort Ratings */}
              <div className="p-3 rounded-xl bg-bg-ivory border border-border-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-deep">
                    Symptom Rating for Comparison (0 - 10)
                  </span>
                  <span className="text-[10px] text-slate-muted">Feeds Pre vs Post Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-muted font-semibold uppercase mb-1">
                      Pre-Meal Discomfort: <strong className="text-navy-deep">{preMealSeverity}/10</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={preMealSeverity}
                      onChange={(e) => setPreMealSeverity(parseInt(e.target.value))}
                      className="w-full accent-teal-japan h-1.5 bg-[#D5DFDC] rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-muted font-semibold uppercase mb-1">
                      Post-Meal Discomfort: <strong className="text-navy-deep">{postMealSeverity}/10</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={postMealSeverity}
                      onChange={(e) => setPostMealSeverity(parseInt(e.target.value))}
                      className="w-full accent-teal-japan h-1.5 bg-[#D5DFDC] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Description / Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Preparation Notes / Food Description
                </label>
                <textarea
                  value={mealDesc}
                  onChange={(e) => setMealDesc(e.target.value)}
                  placeholder="e.g. Cooked with minimal oil; no added onions or garlic (Low-FODMAP compliance)..."
                  rows={2}
                  className="w-full rounded-lg border border-border-soft p-2.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan placeholder:text-slate-muted/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-japan hover:bg-teal-dark text-white font-medium text-xs tracking-wider transition-colors shadow-xs"
              >
                Save Meal Log ({currentMealTotals.calories} kcal • {currentMealTotals.protein}g protein)
              </button>
            </form>
          </Card>

          {/* Meals History */}
          <Card title="Recent Meals" subtitle={`${meals.length} entry(ies) recorded`}>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3 rounded-lg bg-bg-ivory/80 border border-border-soft text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-teal-light text-teal-japan flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Utensils size={13} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-navy-deep">{meal.type}</span>
                          <span className="text-slate-muted text-[11px]">@{meal.time}</span>
                          {meal.totalCalories !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-light text-teal-dark border border-teal-japan/20">
                              {meal.totalCalories} kcal
                            </span>
                          )}
                          {meal.totalProtein !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EBF7F2] text-forest-green border-[#C3E8DC]">
                              {meal.totalProtein}g protein
                            </span>
                          )}
                        </div>
                        {meal.description && (
                          <p className="text-slate-muted text-[11px] mt-0.5">{meal.description}</p>
                        )}
                        {meal.items && meal.items.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {meal.items.map((it, i) => (
                              <span
                                key={i}
                                className="text-[9.5px] px-1.5 py-0.2 rounded bg-surface border border-border-soft text-slate-muted"
                              >
                                {it.name} ({it.quantity}{it.unit}): {it.calories} kcal, {it.protein}g pro
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-slate-muted/50 hover:text-coral-refined p-1"
                      title="Delete meal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Bristol Stool Form Scale (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Log Bowel Movement"
            subtitle="Standardized Bristol Stool Form Scale (BSFS Types 1 - 7)"
          >
            {bowelSuccess && (
              <div className="mb-4 bg-[#EBF7F2] border border-[#C3E8DC] p-3 rounded-lg text-xs text-navy-deep flex items-center gap-2">
                <CheckCircle2 size={15} className="text-forest-green flex-shrink-0" />
                <span className="font-medium">{bowelSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveBowel} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Select Bristol Stool Form (1 - 7) *
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {BRISTOL_SCALE.map((scale) => {
                    const isSelected = selectedBristol === scale.type;
                    return (
                      <div
                        key={scale.type}
                        onClick={() => setSelectedBristol(scale.type)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-teal-light/80 border-teal-japan/50 shadow-xs"
                            : "bg-surface hover:bg-bg-ivory border-border-soft"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 ${
                            isSelected ? "bg-teal-japan text-white" : "bg-bg-ivory text-navy-deep"
                          }`}
                        >
                          {scale.type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-navy-deep">{scale.title}</span>
                            <span className={`text-[9.5px] px-1.5 py-0.2 rounded border font-medium ${scale.badgeColor}`}>
                              {scale.category}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-muted mt-0.5 truncate">{scale.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time, Urgency, Discomfort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={bowelTime}
                    onChange={(e) => setBowelTime(e.target.value)}
                    className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                  >
                    <option value="None">None (Normal)</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                    Discomfort
                  </label>
                  <select
                    value={discomfort}
                    onChange={(e) => setDiscomfort(e.target.value as any)}
                    className="w-full rounded-lg border border-border-soft p-1.5 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan"
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild straining</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={bowelNotes}
                  onChange={(e) => setBowelNotes(e.target.value)}
                  placeholder="e.g. Normal transit sensation ~55m post-meal..."
                  className="w-full rounded-lg border border-border-soft p-2 bg-surface text-xs text-navy-deep focus:outline-none focus:border-teal-japan placeholder:text-slate-muted/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-navy-deep hover:bg-[#20394D] text-white font-medium text-xs tracking-wider transition-colors shadow-xs"
              >
                Save Bowel Record
              </button>
            </form>
          </Card>

          {/* Bowel History */}
          <Card title="Recent Stool Events" subtitle={`${bowelEvents.length} event(s) logged`}>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {bowelEvents.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-bg-ivory/80 border border-border-soft flex items-center justify-between text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#EBF7F2] text-forest-green flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      BS{item.stoolForm}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-navy-deep">
                          Bristol Type {item.stoolForm}
                        </span>
                        <span className="text-slate-muted text-[11px]">@{item.time}</span>
                      </div>
                      <p className="text-slate-muted text-[11px] mt-0.5">
                        Urgency: {item.urgency} • Discomfort: {item.discomfort}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBowel(item.id)}
                    className="text-slate-muted/50 hover:text-coral-refined p-1"
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealsBowel;
