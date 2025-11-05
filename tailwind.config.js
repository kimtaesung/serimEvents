/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
        colors: {
          gray: {
            1: "var(--gray-1)",
            2: "var(--gray-2)",
            3: "var(--gray-3)",
            4: "var(--gray-4)",
            5: "var(--gray-5)",
            6: "var(--gray-6)",
            7: "var(--gray-7)",
            8: "var(--gray-8)",
            9: "var(--gray-9)",
            10: "var(--gray-10)",
            11: "var(--gray-11)",
            12: "var(--gray-12)",
          },
          blue: {
            1: "var(--blue-1)",
            2: "var(--blue-2)",
            3: "var(--blue-3)",
            4: "var(--blue-4)",
            5: "var(--blue-5)",
            6: "var(--blue-6)",
            7: "var(--blue-7)",
            8: "var(--blue-8)",
            9: "var(--blue-9)",
            10: "var(--blue-10)",
            11: "var(--blue-11)",
            12: "var(--blue-12)",
          },
          red: {
            1: "var(--red-1)",
            2: "var(--red-2)",
            3: "var(--red-3)",
            4: "var(--red-4)",
            5: "var(--red-5)",
            6: "var(--red-6)",
            7: "var(--red-7)",
            8: "var(--red-8)",
            9: "var(--red-9)",
            10: "var(--red-10)",
            11: "var(--red-11)",
            12: "var(--red-12)",
          },
          // 필요시 다른 색상도 추가 가능
        },
    },
  },
  plugins: []
}
