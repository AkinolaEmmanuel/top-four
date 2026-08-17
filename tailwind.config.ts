import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      maxWidth: {
        content: "1080px",
        mobile: "430px",
      },
      /* ── Colours ──────────────────────────────────────────────────────
         These now resolve through the design-system semantic tokens
         imported from fig-tokens.css → globals.css bridge layer.
         Tailwind utilities like bg-background, text-foreground, etc.
         pull directly from the design spec.
         ────────────────────────────────────────────────────────────── */
      colors: {
        border:     "var(--border)",
        input:      "var(--input)",
        ring:       "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },

        /* Domain tokens from the design spec */
        brand: {
          DEFAULT:    "var(--color-brand)",
          fill:       "var(--brand-fill)",
          hover:      "var(--color-brand-hover)",
          active:     "var(--color-brand-active)",
          foreground: "var(--color-on-brand)",
        },
        crown: {
          DEFAULT: "var(--color-crown)",
        },

        /* Nav chrome — dark in both themes */
        nav: {
          surface:   "var(--nav-surface)",
          surface2:  "var(--nav-surface-2)",
          text:      "var(--nav-text)",
          quiet:     "var(--nav-text-quiet)",
          faint:     "var(--nav-text-faint)",
          border:    "var(--nav-border)",
          fill:      "var(--nav-fill)",
          accent:    "var(--nav-accent)",
          onaccent:  "var(--nav-on-accent)",
        },

        /* Prediction outcome colours */
        prediction: {
          correct:   "var(--prediction-correct)",
          incorrect: "var(--prediction-incorrect)",
          partial:   "var(--prediction-partial)",
        },

        /* State colours */
        state: {
          live:        "var(--state-live)",
          locked:      "var(--state-locked)",
          provisional: "var(--state-provisional)",
        },

        /* Role colours */
        role: {
          owner:       "var(--role-owner)",
          admin:       "var(--role-admin)",
          participant: "var(--role-participant)",
        },

        /* Status fills + text (design spec pairs) */
        danger: {
          DEFAULT:    "var(--color-danger)",
          text:       "var(--danger-text)",
          surface:    "var(--danger-surface)",
          border:     "var(--danger-border)",
        },
        success: {
          DEFAULT:    "var(--color-success)",
          text:       "var(--success-text)",
          surface:    "var(--success-surface)",
          border:     "var(--success-border)",
        },
        warn: {
          DEFAULT:    "var(--color-warning)",
          text:       "var(--warn-text)",
          surface:    "var(--warn-surface)",
          border:     "var(--warn-border)",
        },
      },

      /* ── Elevation / Shadows ─────────────────────────────────────── */
      boxShadow: {
        "elev-1":    "var(--elev-1)",
        "elev-2":    "var(--elev-2)",
        "elev-3":    "var(--elev-3)",
        "elev-4":    "var(--elev-4)",
        "elev-glow": "var(--elev-glow)",
        /* Keep the branded glows for backward compat */
        "glow-sky":     "0 10px 36px rgba(14, 165, 233, 0.45)",
        "glow-emerald": "0 10px 36px rgba(16, 185, 129, 0.35)",
      },

      /* ── Border Radius ───────────────────────────────────────────── */
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
        xl:    "12px",
        lg:    "var(--radius)",
        md:    "calc(var(--radius) - 2px)",
        sm:    "calc(var(--radius) - 4px)",
      },

      /* ── Typography ──────────────────────────────────────────────
         Design spec: DM Sans (--family-primary) for headings,
                      Sora   (--family-secondary) for body.
         The CSS variables --font-heading and --font-body are set
         in app/layout.tsx by next/font/google.
         ──────────────────────────────────────────────────────────── */
      fontFamily: {
        heading: ["var(--font-heading)", "DM Sans", ...fontFamily.sans],
        sans:    ["var(--font-body)", "Sora", ...fontFamily.sans],
      },

      /* ── Spacing (density tokens from spec) ──────────────────────── */
      spacing: {
        "gutter":      "var(--gutter)",
        "tap-min":     "var(--tap-min)",
        "row-compact": "var(--row-compact)",
        "row-default": "var(--row-default)",
        "row-relaxed": "var(--row-relaxed)",
      },



      /* ── Keyframes ───────────────────────────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
