import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Override default text sizes to use 1.5 line-height for WCAG compliance
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
      },
      lineHeight: {
        'tight': '1.5',
        'snug': '1.5',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
    },
  },
  plugins: [daisyui, typography],
  daisyui: {
    themes: ["light", "dark", "dracula"],
  },
};

export default config as Config;