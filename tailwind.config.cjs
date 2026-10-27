/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Core Visual Identity: Midnight Emerald + Aurora Mint + Warm Ivory
        "midnight": {
          DEFAULT: "#103B35", // Deep Midnight Green: brand, sidebar, prominent headings
          dark: "#0B2723",
          light: "#164E44",
        },
        "emerald": {
          DEFAULT: "#176B5B", // Forest Emerald: primary buttons, active states
          forest: "#176B5B",
          dark: "#103B35",
          hover: "#13584B",
          light: "#DCEFE7",
        },
        "mint": {
          DEFAULT: "#68DCC0", // Aurora Mint: highlights, chart accents, indicators
          aurora: "#68DCC0",
          glow: "rgba(104, 220, 192, 0.25)",
        },
        "sage": {
          DEFAULT: "#DCEFE7", // Soft Sage: card backgrounds, navigation items
          soft: "#DCEFE7",
          subtle: "#F0F7F4",
        },
        "ivory": {
          DEFAULT: "#F7F6F0", // Warm Ivory: main application background
          warm: "#F7F6F0",
        },
        "charcoal": {
          DEFAULT: "#182B2A", // Deep Charcoal: primary text and headings
          dark: "#11201F",
        },
        "slate-grey": "#64748B", // Slate Grey: secondary text and descriptions
        "amber-soft": "#F4B860", // Soft Amber: warnings and alerts
        "coral-red": "#E87575", // Coral Red: errors and critical alerts

        // Semantic & Backward-Compatible Theme Mappings
        "bg-ivory": "#F7F6F0",     // Warm Ivory background
        "surface": "#FFFFFF",      // Pure White cards & surfaces
        "navy-deep": "#182B2A",    // Deep Charcoal headings & text
        "slate-muted": "#64748B",  // Slate Grey secondary text
        "teal-japan": "#176B5B",   // Forest Emerald interactive accent
        "teal-dark": "#103B35",    // Deep Midnight Green
        "teal-light": "#DCEFE7",   // Soft Sage chip & indicator background
        "jade-soft": "#68DCC0",    // Aurora Mint chart & indicator accent
        "sakura-pale": "#FCECEC",  // Soft Coral tint
        "mist-blue": "#EBF5F1",    // Subtle Sage tint
        "border-soft": "#E2E8F0",  // Refined soft slate border
        "amber-muted": "#F4B860",  // Soft Amber
        "coral-refined": "#E87575",// Coral Red
        "forest-green": "#176B5B", // Forest Emerald

        // Mappings for older utility classes
        "bg-main": "#F7F6F0",
        "card": "#FFFFFF",
        "primary": "#176B5B",
        "peach": "#FCECEC",
        "text-dark": "#182B2A",
        "teal-muted": "#176B5B",
        "coral-alert": "#E87575",
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(16, 59, 53, 0.04), 0 3px 12px rgba(16, 59, 53, 0.03)',
        'elevated': '0 4px 20px -2px rgba(16, 59, 53, 0.07), 0 2px 6px rgba(16, 59, 53, 0.03)',
        'card': '0 1px 3px rgba(16, 59, 53, 0.04), 0 3px 10px rgba(16, 59, 53, 0.03)',
        'glow-mint': '0 0 16px rgba(104, 220, 192, 0.28)',
        'sidebar-active': '0 2px 8px rgba(11, 39, 35, 0.25)',
      },
    },
  },
  plugins: [],
};
