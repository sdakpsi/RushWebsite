/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        'shooting-star': 'shooting-star 5s linear infinite',
      },
      fontFamily: {
        'libre-caslon': ['LibreCaslon', 'serif'],
        bonVivant: ['var(--font-bon-vivant)', 'serif'],
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
        'shooting-star': {
          '0%': {
            transform: 'translateX(0) translateY(0) rotate(-45deg)',
            opacity: 1,
          },
          '70%': { opacity: 1 },
          '100%': {
            transform: 'translateX(1000px) translateY(1000px) rotate(-45deg)',
            opacity: 0,
          },
        },
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        btn: {
          background: 'hsl(var(--btn-background))',
          'background-hover': 'hsl(var(--btn-background-hover))',
        },
      },
    },
  },
  plugins: [],
};
