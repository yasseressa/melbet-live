import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        melbet: {
          yellow: "#FFC400",
          black: "#0E0E0E"
        }
      }
    },
  },
  plugins: [],
};
export default config;
