import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Moon News brand — deep midnight blue with a crescent-gold accent.
        brand: {
          50: "#f2f1ff",
          100: "#e5e3ff",
          200: "#cbc7ff",
          300: "#a89fff",
          400: "#7f70f7",
          500: "#5f46e8",
          600: "#4c2fd0",
          700: "#3e26ab",
          800: "#34228a",
          900: "#2e2270",
          950: "#1b134a",
        },
        accent: {
          50: "#fffaeb",
          100: "#fdf0c7",
          200: "#fbdf90",
          300: "#f8c95c",
          400: "#f6b735",
          500: "#ee9a1c",
          600: "#d07613",
          700: "#af5514",
          800: "#8f4417",
          900: "#763917",
          950: "#421a06",
        },
        ink: {
          50: "#f7f7fb",
          100: "#eeeef5",
          200: "#dadaea",
          300: "#b5b6cf",
          400: "#8a8cab",
          500: "#6b6d8b",
          600: "#55566f",
          700: "#45455a",
          800: "#3b3b4c",
          900: "#333342",
          950: "#121220",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(27 19 74 / 0.05), 0 1px 3px 0 rgb(27 19 74 / 0.07)",
        "card-hover":
          "0 12px 28px -8px rgb(27 19 74 / 0.18), 0 4px 10px -4px rgb(27 19 74 / 0.08)",
        nav: "0 1px 0 0 rgb(27 19 74 / 0.07)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
