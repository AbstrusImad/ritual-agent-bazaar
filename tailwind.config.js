/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#060505",
        graphite: "#141313",
        charcoal: "#1c1a18",
        bronzeblack: "#22190f",
        champagne: "#e8c884",
        gold: "#d9a441",
        golddeep: "#a9772a",
        emerald: "#4fd8a0",
        emeralddeep: "#1f6b4d",
        ivory: "#f3ede1",
        silver: "#c9c3b6",
        ruby: "#d14e56",
        rubydeep: "#7d2b34",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        capsule: "0 30px 80px -20px rgba(0,0,0,0.9)",
        goldglow: "0 0 40px -4px rgba(217,164,65,0.45)",
        emeraldglow: "0 0 36px -4px rgba(79,216,160,0.4)",
        rubyglow: "0 0 34px -6px rgba(209,78,86,0.4)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0.2" },
          "50%": { opacity: "0.7" },
          "100%": { transform: "translateY(-40px) translateX(6px)", opacity: "0" },
        },
        spinslow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulseglow: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        flicker: {
          "0%, 88%, 100%": { opacity: "1" },
          "90%": { opacity: "0.82" },
          "92%": { opacity: "0.96" },
          "94%": { opacity: "0.86" },
          "96%": { opacity: "1" },
        },
        ringpulse: {
          "0%": { opacity: "0.55", transform: "translateX(-50%) scale(0.72)" },
          "80%": { opacity: "0" },
          "100%": { opacity: "0", transform: "translateX(-50%) scale(1.3)" },
        },
        sheen: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 9s linear infinite",
        spinslow: "spinslow 26s linear infinite",
        spinslowrev: "spinslow 34s linear infinite reverse",
        pulseglow: "pulseglow 4s ease-in-out infinite",
        flicker: "flicker 7s linear infinite",
        ringpulse: "ringpulse 3.6s ease-out infinite",
        sheen: "sheen 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
