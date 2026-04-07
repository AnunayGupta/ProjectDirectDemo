import type { Config } from "tailwindcss";
import { firmConfig } from "./lib/firm-config";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: firmConfig.colors,
    },
  },
  plugins: [],
};
export default config;
