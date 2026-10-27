// src/services/nutritionDb.ts
import { FoodItem, MealFoodItem, PatientProfile, DailyNutritionTarget } from "../types";

export const NUTRITION_DATABASE: FoodItem[] = [
  // Grains
  {
    id: "food-oats",
    name: "Rolled Oats (Dry)",
    category: "Grain",
    servingUnit: "g",
    servingSize: 100,
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6,
    digestiveFriendly: true,
    digestiveNotes: "High in beta-glucan soluble fiber, gentle on stomach lining.",
    gramsPerCup: 90,
    gramsPerTbsp: 6,
  },
  {
    id: "food-white-rice",
    name: "Steamed White Jasmine Rice",
    category: "Grain",
    servingUnit: "g",
    servingSize: 100,
    calories: 130,
    protein: 2.7,
    carbs: 28.2,
    fat: 0.3,
    fiber: 0.4,
    digestiveFriendly: true,
    digestiveNotes: "Low FODMAP, easily absorbed, ideal for sensitive stomachs or acute flares.",
    gramsPerCup: 160,
    gramsPerTbsp: 12,
  },
  {
    id: "food-brown-rice",
    name: "Steamed Brown Rice",
    category: "Grain",
    servingUnit: "g",
    servingSize: 100,
    calories: 111,
    protein: 2.6,
    carbs: 23.0,
    fat: 0.9,
    fiber: 1.8,
    digestiveFriendly: true,
    digestiveNotes: "Whole grain with intact germ, provides sustained transit bulk.",
    gramsPerCup: 195,
    gramsPerTbsp: 12,
  },
  {
    id: "food-quinoa",
    name: "Cooked Quinoa",
    category: "Grain",
    servingUnit: "g",
    servingSize: 100,
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    fiber: 2.8,
    digestiveFriendly: true,
    digestiveNotes: "Naturally gluten-free complete plant protein, easily digestible.",
    gramsPerCup: 185,
    gramsPerTbsp: 12,
  },
  {
    id: "food-sourdough",
    name: "Artisan Sourdough Bread",
    category: "Grain",
    servingUnit: "slice",
    servingSize: 1, // 1 slice is ~50g
    calories: 120,
    protein: 4.0,
    carbs: 23.0,
    fat: 0.8,
    fiber: 1.2,
    digestiveFriendly: true,
    digestiveNotes: "Fermentation partially breaks down fructans and phytic acid.",
    gramsPerPiece: 50,
  },
  {
    id: "food-boiled-potatoes",
    name: "Boiled Yellow Potatoes",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 87,
    protein: 1.9,
    carbs: 20.1,
    fat: 0.1,
    fiber: 1.8,
    digestiveFriendly: true,
    digestiveNotes: "When cooled, develops resistant starch that feeds beneficial colonic flora.",
    gramsPerCup: 150,
    gramsPerPiece: 140, // 1 medium potato
  },

  // Proteins
  {
    id: "food-chicken-breast",
    name: "Grilled Chicken Breast (Skinless)",
    category: "Protein",
    servingUnit: "g",
    servingSize: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Lean protein, easily hydrolyzed by gastric pepsin without triggering bile surge.",
    gramsPerCup: 140, // diced
  },
  {
    id: "food-salmon",
    name: "Steamed Atlantic Salmon",
    category: "Protein",
    servingUnit: "g",
    servingSize: 100,
    calories: 208,
    protein: 20.4,
    carbs: 0.0,
    fat: 13.4,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Rich in anti-inflammatory omega-3 fatty acids that support mucosal integrity.",
    gramsPerPiece: 150, // 1 fillet
  },
  {
    id: "food-eggs",
    name: "Poached / Soft-Boiled Egg",
    category: "Protein",
    servingUnit: "piece",
    servingSize: 1, // ~50g
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Highest biological value protein, minimal residue in gut lumen.",
    gramsPerPiece: 50,
  },
  {
    id: "food-tofu",
    name: "Silken / Soft Organic Tofu",
    category: "Protein",
    servingUnit: "g",
    servingSize: 100,
    calories: 76,
    protein: 8.1,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    digestiveFriendly: true,
    digestiveNotes: "Ultra-gentle plant protein, low fiber, suitable during gastric sensitivity.",
    gramsPerCup: 240,
  },
  {
    id: "food-white-fish",
    name: "Baked Cod / Whitefish Fillet",
    category: "Protein",
    servingUnit: "g",
    servingSize: 100,
    calories: 105,
    protein: 22.8,
    carbs: 0.0,
    fat: 0.9,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Ultra-lean, low histamine, very light on motility transit.",
    gramsPerPiece: 125,
  },

  // Vegetables
  {
    id: "food-steamed-carrots",
    name: "Tender Steamed Carrots",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 35,
    protein: 0.8,
    carbs: 8.2,
    fat: 0.2,
    fiber: 2.8,
    digestiveFriendly: true,
    digestiveNotes: "Cooking softens insoluble pectin, providing non-irritating bulk.",
    gramsPerCup: 150,
  },
  {
    id: "food-zucchini",
    name: "Sauteed Zucchini / Courgette",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 21,
    protein: 1.5,
    carbs: 3.6,
    fat: 0.4,
    fiber: 1.1,
    digestiveFriendly: true,
    digestiveNotes: "Low FODMAP vegetable, high water content, easily processed.",
    gramsPerCup: 180,
  },
  {
    id: "food-steamed-broccoli",
    name: "Steamed Broccoli Florets",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fat: 0.4,
    fiber: 2.6,
    digestiveFriendly: false,
    digestiveNotes: "Florets are lower in FODMAPs than stems; rich in sulforaphane.",
    gramsPerCup: 150,
  },
  {
    id: "food-spinach",
    name: "Wilted Baby Spinach",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    digestiveFriendly: true,
    digestiveNotes: "Low FODMAP when cooked, rich in magnesium which assists bowel motility.",
    gramsPerCup: 180,
  },
  {
    id: "food-cucumber",
    name: "Peeled Seedless Cucumber",
    category: "Vegetable",
    servingUnit: "g",
    servingSize: 100,
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    digestiveFriendly: true,
    digestiveNotes: "96% water, hydrating, seeds removed to prevent mucosal irritation.",
    gramsPerCup: 130,
  },

  // Fruits
  {
    id: "food-banana",
    name: "Ripe Banana",
    category: "Fruit",
    servingUnit: "piece",
    servingSize: 1, // ~118g
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    fiber: 3.1,
    digestiveFriendly: true,
    digestiveNotes: "BRAT diet staple, rich in potassium and gentle soluble pectin.",
    gramsPerPiece: 118,
  },
  {
    id: "food-blueberries",
    name: "Fresh Blueberries",
    category: "Fruit",
    servingUnit: "g",
    servingSize: 100,
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4,
    digestiveFriendly: true,
    digestiveNotes: "Rich in anthocyanin polyphenols that modulate gut microbiome diversity.",
    gramsPerCup: 148,
  },
  {
    id: "food-papaya",
    name: "Fresh Papaya Slices",
    category: "Fruit",
    servingUnit: "g",
    servingSize: 100,
    calories: 43,
    protein: 0.5,
    carbs: 10.8,
    fat: 0.3,
    fiber: 1.7,
    digestiveFriendly: true,
    digestiveNotes: "Contains papain, a natural proteolytic enzyme assisting protein digestion.",
    gramsPerCup: 145,
  },
  {
    id: "food-applesauce",
    name: "Unsweetened Pureed Applesauce",
    category: "Fruit",
    servingUnit: "cup",
    servingSize: 1, // ~240g
    calories: 102,
    protein: 0.4,
    carbs: 27.5,
    fat: 0.2,
    fiber: 2.7,
    digestiveFriendly: true,
    digestiveNotes: "Pre-cooked pectin firms watery stool without irritating bowel walls.",
    gramsPerCup: 240,
    gramsPerTbsp: 15,
  },

  // Dairy & Alternatives
  {
    id: "food-greek-yogurt",
    name: "Plain Low-Fat Greek Yogurt",
    category: "Dairy/Alternative",
    servingUnit: "g",
    servingSize: 100,
    calories: 73,
    protein: 10.0,
    carbs: 3.6,
    fat: 2.0,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Strained whey reduces lactose content; delivers live probiotic cultures.",
    gramsPerCup: 240,
    gramsPerTbsp: 15,
  },
  {
    id: "food-kefir",
    name: "Fermented Milk Kefir",
    category: "Dairy/Alternative",
    servingUnit: "ml",
    servingSize: 100,
    calories: 61,
    protein: 3.3,
    carbs: 4.8,
    fat: 3.5,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Contains over 30 distinct probiotic strains; breaks down 99% of lactose.",
    gramsPerCup: 240,
  },
  {
    id: "food-almond-milk",
    name: "Unsweetened Almond Milk",
    category: "Dairy/Alternative",
    servingUnit: "ml",
    servingSize: 100,
    calories: 15,
    protein: 0.6,
    carbs: 0.3,
    fat: 1.3,
    fiber: 0.2,
    digestiveFriendly: true,
    digestiveNotes: "100% dairy and lactose free, low calorie carrier for smoothies and oats.",
    gramsPerCup: 240,
  },

  // Fats & Seeds
  {
    id: "food-olive-oil",
    name: "Extra Virgin Olive Oil",
    category: "Fat/Oil",
    servingUnit: "tbsp",
    servingSize: 1, // ~14g
    calories: 119,
    protein: 0.0,
    carbs: 0.0,
    fat: 13.5,
    fiber: 0.0,
    digestiveFriendly: true,
    digestiveNotes: "Polyphenol-rich monounsaturated fat that lubricates transit gently.",
    gramsPerTbsp: 14,
  },
  {
    id: "food-chia-seeds",
    name: "Chia Seeds (Hydrated)",
    category: "Fat/Oil",
    servingUnit: "tbsp",
    servingSize: 1, // ~12g
    calories: 58,
    protein: 2.0,
    carbs: 5.0,
    fat: 3.7,
    fiber: 4.1,
    digestiveFriendly: true,
    digestiveNotes: "Hydrophilic mucilage coats GI lining and promotes consistent stool formation.",
    gramsPerTbsp: 12,
  },
  {
    id: "food-avocado",
    name: "Fresh Avocado",
    category: "Fat/Oil",
    servingUnit: "g",
    servingSize: 50, // ~half avocado
    calories: 80,
    protein: 1.0,
    carbs: 4.3,
    fat: 7.3,
    fiber: 3.4,
    digestiveFriendly: true,
    digestiveNotes: "High in potassium and gentle monounsaturated fats; note sorbitol in large portions.",
    gramsPerPiece: 150, // 1 whole avocado
  },
  {
    id: "food-peanut-butter",
    name: "Natural Smooth Peanut Butter",
    category: "Fat/Oil",
    servingUnit: "tbsp",
    servingSize: 1, // ~16g
    calories: 94,
    protein: 4.0,
    carbs: 3.1,
    fat: 8.0,
    fiber: 1.0,
    digestiveFriendly: true,
    digestiveNotes: "Calorie-dense, low FODMAP in 2 tbsp portions.",
    gramsPerTbsp: 16,
  },
];

// Quantity Validation Helper
export interface QuantityValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

export const validateFoodQuantity = (
  quantity: number | string | undefined | null,
  unit: string
): QuantityValidationResult => {
  if (quantity === "" || quantity === null || quantity === undefined) {
    return {
      isValid: false,
      errorMessage: "Please enter a portion quantity.",
    };
  }

  const num = typeof quantity === "number" ? quantity : parseFloat(quantity);

  if (isNaN(num)) {
    return {
      isValid: false,
      errorMessage: "Quantity must be a valid numeric value.",
    };
  }

  if (num <= 0) {
    return {
      isValid: false,
      errorMessage: "Quantity must be greater than zero.",
    };
  }

  // Realistic boundary checks per unit
  if ((unit === "g" || unit === "ml") && num > 3000) {
    return {
      isValid: true,
      warningMessage: `Large portion size (${num} ${unit}). Please verify.`,
    };
  }

  if ((unit === "piece" || unit === "slice" || unit === "cup" || unit === "serving" || unit === "servings") && num > 20) {
    return {
      isValid: true,
      warningMessage: `Large quantity (${num} ${unit}s). Please verify.`,
    };
  }

  if (unit === "tbsp" && num > 30) {
    return {
      isValid: true,
      warningMessage: `High quantity (${num} tbsp). Please verify.`,
    };
  }

  return { isValid: true };
};

// Calculate proportional nutrition for a given food, quantity, and selected unit
// Mathematically exact proportionality:
// Ratio = effective quantity in base units / base servingSize
export const calculateFoodItemNutrition = (
  food: FoodItem,
  quantity: number,
  unit: string
): MealFoodItem => {
  const safeQty = Math.max(0, isNaN(quantity) ? 0 : quantity);

  let ratio = 1.0;
  const baseSize = food.servingSize || 100;
  const baseUnit = food.servingUnit;

  // Case 1: Same unit (e.g. g to g, ml to ml, piece to piece, slice to slice, tbsp to tbsp)
  if (unit === baseUnit) {
    ratio = safeQty / baseSize;
  }
  // Case 2: Unit is "serving" or "servings"
  else if (unit === "serving" || unit === "servings") {
    // 1 serving is exactly 1 base servingSize
    ratio = safeQty;
  }
  // Case 3: Base is grams (g)
  else if (baseUnit === "g") {
    if (unit === "cup") {
      const gPerCup = food.gramsPerCup || 150;
      ratio = (safeQty * gPerCup) / baseSize;
    } else if (unit === "tbsp") {
      const gPerTbsp = food.gramsPerTbsp || 15;
      ratio = (safeQty * gPerTbsp) / baseSize;
    } else if (unit === "piece" || unit === "slice") {
      const gPerPiece = food.gramsPerPiece || 100;
      ratio = (safeQty * gPerPiece) / baseSize;
    } else if (unit === "ml") {
      // Density ~ 1g/ml
      ratio = safeQty / baseSize;
    } else {
      ratio = safeQty / baseSize;
    }
  }
  // Case 4: Base is milliliters (ml)
  else if (baseUnit === "ml") {
    if (unit === "cup") {
      // 1 cup = 240 ml
      ratio = (safeQty * 240) / baseSize;
    } else if (unit === "tbsp") {
      // 1 tbsp = 15 ml
      ratio = (safeQty * 15) / baseSize;
    } else if (unit === "g") {
      ratio = safeQty / baseSize;
    } else {
      ratio = safeQty / baseSize;
    }
  }
  // Case 5: Base is piece (e.g. Banana: 1 piece is 118g)
  else if (baseUnit === "piece") {
    if (unit === "g") {
      const gPerPiece = food.gramsPerPiece || 118;
      ratio = safeQty / gPerPiece;
    } else {
      ratio = safeQty / baseSize;
    }
  }
  // Case 6: Base is slice (e.g. Sourdough: 1 slice is 50g)
  else if (baseUnit === "slice") {
    if (unit === "g") {
      const gPerSlice = food.gramsPerPiece || 50;
      ratio = safeQty / gPerSlice;
    } else {
      ratio = safeQty / baseSize;
    }
  }
  // Case 7: Base is tbsp (e.g. Olive oil: 1 tbsp is 14g)
  else if (baseUnit === "tbsp") {
    if (unit === "g" || unit === "ml") {
      const gPerTbsp = food.gramsPerTbsp || 14;
      ratio = safeQty / gPerTbsp;
    } else if (unit === "cup") {
      // 1 cup = 16 tbsp
      ratio = (safeQty * 16) / baseSize;
    } else {
      ratio = safeQty / baseSize;
    }
  }
  // Fallback
  else {
    ratio = safeQty / baseSize;
  }

  // Calculate proportional macronutrients
  const calories = Math.round(food.calories * ratio);
  const protein = parseFloat((food.protein * ratio).toFixed(1));
  const carbs = parseFloat((food.carbs * ratio).toFixed(1));
  const fat = parseFloat((food.fat * ratio).toFixed(1));
  const fiber = parseFloat((food.fiber * ratio).toFixed(1));

  return {
    foodId: food.id,
    name: food.name,
    quantity: safeQty,
    unit,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    isEstimated: false,
  };
};

// Calculate personalized targets from patient profile
// Formula: Mifflin-St Jeor equation + activity multiplier
export const calculatePersonalizedTargets = (profile?: PatientProfile | null): DailyNutritionTarget => {
  if (!profile || !profile.weightKg || !profile.heightCm || !profile.age) {
    return {
      bmr: 1540,
      tdee: 2125,
      targetCalories: 2125,
      targetProteinGrams: 75,
      targetFiberGrams: 28,
    };
  }

  const { weightKg, heightCm, age, sex, activityLevel } = profile;

  // Mifflin-St Jeor BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "Male") {
    bmr += 5;
  } else if (sex === "Female") {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  bmr = Math.round(bmr);

  // Activity multipliers
  let multiplier = 1.2; // Sedentary
  if (activityLevel === "Lightly Active") multiplier = 1.375;
  else if (activityLevel === "Moderately Active") multiplier = 1.55;
  else if (activityLevel === "Very Active") multiplier = 1.725;

  const tdee = Math.round(bmr * multiplier);

  // Target Protein: 1.1 g/kg for gastro health and lean preservation
  const targetProteinGrams = Math.round(weightKg * 1.1);

  // Target Fiber: ~14g per 1000 kcal
  const targetFiberGrams = Math.round((tdee / 1000) * 14);

  return {
    bmr,
    tdee,
    targetCalories: tdee,
    targetProteinGrams,
    targetFiberGrams,
  };
};

// Smart Recommendations generator based on remaining daily calories & protein
export const getNutritionalSuggestions = (
  remainingCalories: number,
  remainingProtein: number,
  restrictions: string[] = []
): { food: FoodItem; reason: string }[] => {
  const isGlutenFree = restrictions.includes("Gluten-free");
  const isLactoseFree = restrictions.includes("Lactose-free");
  const isVegetarian = restrictions.includes("Vegetarian") || restrictions.includes("Vegan");

  return NUTRITION_DATABASE.filter((item) => {
    if (isGlutenFree && item.id === "food-sourdough") return false;
    if (isLactoseFree && (item.id === "food-greek-yogurt" || item.id === "food-kefir")) return false;
    if (isVegetarian && (item.id === "food-chicken-breast" || item.id === "food-salmon" || item.id === "food-white-fish")) return false;

    if (!item.digestiveFriendly) return false;

    if (remainingProtein > 15 && item.protein >= 8) return true;
    if (remainingCalories < 250 && item.calories <= 120) return true;
    if (remainingCalories >= 250 && item.category === "Grain") return true;

    return false;
  }).slice(0, 3).map((food) => {
    let reason = "Digestive-friendly staple with gentle GI transit.";
    if (remainingProtein > 15 && food.protein >= 8) {
      reason = `Helps meet remaining ${remainingProtein}g protein requirement (${food.protein}g / serving).`;
    } else if (remainingCalories < 250) {
      reason = `Light snack fitting your remaining ${remainingCalories} kcal allowance.`;
    }
    return { food, reason };
  });
};
