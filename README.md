# GutHub — Digestive Health Intelligence Platform

**Continuous Non-Invasive Peristalsis, Gastrocolic Motility Surge & Medication Adherence Surveillance**  
*Developed for MEDAITHON '26 • Advanced Digital Health Prototype*

---

## 🌟 Overview
**GutHub** is a digital health platform designed to visualize continuous non-invasive digestive monitoring data. It bridges wearable sensors (such as the bio-acoustic **GutPatch** and autonomic **SmartBand**) with intelligent medication adherence verification, automated meal nutrition tracking, Bristol stool form logging, and longitudinal clinical analytics.

---

## 🎨 Visual Identity & Design System
Inspired by Japanese minimalist precision and modern medical technology, GutHub uses a refined **Midnight Emerald + Aurora Mint + Warm Ivory** palette:

* **Deep Midnight Green (`#103B35`):** Sidebar navigation, brand headers, and baseline reference indicators.
* **Forest Emerald (`#176B5B`):** Primary action buttons, postprandial response bars, and active clinical indicators.
* **Aurora Mint (`#68DCC0`):** Brand logo emblem, telemetry focus nodes, status pulses, and strain curves.
* **Soft Sage (`#DCEFE7`):** Card badges, indicator pills, and subtle borders.
* **Warm Ivory (`#F7F6F0`):** Softer, organic, non-sterile application canvas.
* **Pure White (`#FFFFFF`):** High-contrast analytical cards and clinical consultation modals.
* **Deep Charcoal (`#182B2A`):** Primary typography and vital metrics.
* **Slate Grey (`#64748B`):** Secondary descriptions and coordinate axes.
* **Soft Amber (`#F4B860`):** Motion-artifact warnings and attention indicators.
* **Coral Red (`#E87575`):** High-severity discomfort markers and emergency alerts.

---

## 🚀 Quick Setup & Run Instructions

```bash
# 1. Clone repository
git clone https://github.com/joshikaguna/GutHub.git
cd GutHub

# 2. Install dependencies
npm install

# 3. Launch Vite Development Server
npm run dev

# 4. Open in browser:
http://localhost:5173
```

To create an optimized production build:
```bash
npm run build
```

---

## 📱 Core Pages & Intelligence Modules

1. **Patient Dashboard (`/patient`)**
   * **Hero Telemetry Banner:** Active monitoring cohort, patient protocol tags, and fast action shortcuts.
   * **4 Bento Clinical Panels:** Acoustic Motility (events/min), Autonomic Vitals (BPM, Temp, EDA), Medication Adherence (with 1-click Confirm Dose), and Daily Nutrition vs Goals.
   * **Pre- vs. Post-Meal Gastrocolic Motility Comparison:** Interactive grouped bar charts comparing Breakfast, Lunch, Snack, and Dinner with metric toggles (Motility, Discomfort, Pulse) and dynamically calculated percentage surges.
   * **Continuous Sensor Stream:** Real-time acoustic peristalsis, PPG heart rate micro-jitter, and electrodermal conductance.
   * **Adherence Consistency Streaks:** 7-day adherence dot matrix for meal logging and medication compliance.
   * **Multimodal Health Timeline:** Categorized chronological feed synthesizing dietary, medication, sensor, and stool events.

2. **Pre- vs. Post-Meal Gastrointestinal Analysis (`/comparison`)**
   * Deep multi-metric analytical dashboard evaluating gastrocolic reflex dynamics across multiple days and meals.
   * Motility curves and Bristol stool correlation matrix.

3. **Meals & Bowel Events (`/meals`)**
   * **Automatic Nutrition Engine:** 25+ gastro-friendly reference foods with dynamic proportional calorie, protein, carbohydrate, fat, and fiber calculation.
   * **Multi-Item Meal Builder:** Live preview, portion validation across grams, milliliters, cups, tablespoons, slices, and servings.
   * **Bristol Stool Form Scale (BSFS Types 1–7):** Clinical classification (Constipation, Normal, Diarrhea) with urgency and discomfort tracking.

4. **GutPatch Monitoring (`/gpatch`)**
   * Bio-acoustic contact sensing tracking peristalsis contraction sound events (<500 Hz).
   * Motion-artifact detection and audio bandpass filtering simulation.
   * Acoustic motility session management and comparative gastrocolic reflex review.

5. **Symptom Journal & Progress Intelligence (`/symptom`)**
   * Interactive longitudinal progress graph (7-day, 14-day, 30-day, and all-time ranges).
   * 8 clinical symptom categories with 0–10 severity slider.
   * Automated trend classification (*Improving*, *Worsening*, *Stable*).

6. **Medication Adherence (`/medication`)**
   * Prescription dosage management with Smart Medication PillBox sensor synchronization.
   * Adherence percentage calculation with scheduled intake confirmation.

7. **Daily Digestive-Health Timeline (`/timeline`)**
   * Chronological fusion of meals, medications, acoustic surveillance windows, and bowel evacuations.

8. **Personal Clinical Insights (`/insights`)**
   * Machine-observed exploratory correlations between food intake, abdominal strain expansion, and acoustic motility surges.

9. **Doctor Clinical Summary Sheet (`/summary`)**
   * Print-ready and downloadable PDF consultation summary document with raw JSON clinical data export.

10. **Device Management (`/devices`)**
    * Hardware status cards for SmartBand, GutPatch, and Smart Medication Box with battery levels, RSSI signal strength, and firmware diagnostics.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, PostCSS, Lucide Icons
* **Data Visualization:** Recharts (Grouped Bar Charts, Line Charts, Area Charts)
* **Local State & Storage:** Reactive Browser LocalStorage with automatic schema migration
* **Typography:** Plus Jakarta Sans (Headings), Inter (Body)

---

## ⚖️ Non-Diagnostic Disclaimer
GutHub is an exploratory prototype developed for **MEDAITHON '26**. All bio-acoustic peristalsis rates, autonomic vitals, and adherence signals are client-modeled for clinical research and human-interface demonstration. Not intended for direct medical diagnosis or prescriptive use.
