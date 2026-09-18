import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-border": "var(--card-border)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        accent: "var(--accent)",
        "nav-active": "var(--nav-active)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ['"Noto Nastaliq Urdu Arabic"', "var(--font-inter)", "sans-serif"],
        serif: ['"Noto Nastaliq Urdu Arabic"', "var(--font-amiri)", "serif"],
        amiri: ['"Noto Nastaliq Urdu Arabic"', "var(--font-amiri)", "serif"], // keeping for backwards compatibility
        lora: ['"Noto Nastaliq Urdu Arabic"', "var(--font-lora)", "serif"],
        nastaliq: ['"Noto Nastaliq Urdu Arabic"', "serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
