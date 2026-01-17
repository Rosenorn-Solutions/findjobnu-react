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