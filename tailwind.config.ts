import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#071827",
        harbor: "#0b3f5c",
        reef: "#0f8f75",
        kelp: "#176447",
        foam: "#f4fbf9"
      },
      boxShadow: {
        soft: "0 20px 70px rgba(7, 24, 39, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
