import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'media',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base references
        background: "var(--bg-primary)",
        foreground: "var(--text-body)",
        
        // Semantic Tokens
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        
        "border-subtle": "var(--border-subtle)",
        "border-pill": "var(--border-pill)",
        
        "text-heading": "var(--text-heading)",
        "text-body": "var(--text-body)",
        "text-muted": "var(--text-muted)",
        
        accent: "var(--accent)",
        "accent-bg": "var(--accent-bg)",

        // Legacy tokens mapped to semantic tokens for backward compatibility
        card: "var(--bg-card)",
        "card-border": "var(--border-subtle)",
        muted: "var(--text-muted)",
        primary: "var(--accent)",
        "primary-light": "var(--accent-bg)",
        "nav-active": "var(--bg-secondary)",
        border: "var(--border-subtle)",
      },
      fontFamily: {
        serif: ["var(--font-amiri)", "serif"],
        amiri: ["var(--font-amiri)", "serif"],
        lora: ["var(--font-lora)", "serif"],
        condensed: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
