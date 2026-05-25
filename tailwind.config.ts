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
        amiri: ["var(--font-amiri)", "serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
