/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f9fafb',
        surface: '#ffffff',
        muted: '#6b7280',
        primary: {
          DEFAULT: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 10px 40px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '0.9rem',
      },
    },
  },
  plugins: [],
}
