/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        waterRipple: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) rotate(12deg)' },
          '100%': { transform: 'translateX(100%) rotate(12deg)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.23,1,0.32,1) both',
        waterRipple: 'waterRipple 10s ease-in-out infinite',
        shine: 'shine 2.5s linear infinite',
      },
      backgroundImage: {
        'glass-water': 'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.4) 0%, rgba(173,216,230,0.2) 60%, rgba(255,255,255,0.1) 100%)',
        'water-gradient': 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
      },
      blur: {
        glass: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      },
    },
  },
  plugins: [],
}
