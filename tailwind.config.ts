import type { Config } from "tailwindcss";

export default {
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
        pinkCustom: "var(--color-collectif-pink)"
      },
      fontSize: {
        'custom-size': 'var(--custom-font-size)',
      },
      gap: {
        '15': '3.75rem',
        '20': '5rem',
        '80': '15rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
