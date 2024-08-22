import type { Config } from 'tailwindcss'

export default {
  darkMode: ['selector'],
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      display: ['Source Serif Pro', 'Georgia', 'serif'],
      body: ['Synonym', 'system-ui', 'sans-serif'],
    },

    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        darkBg: '#202124',
        darkSubBg: '#292A2D',
        darkText: '#E8EAED',
        darkSubText: '#9AA0A6',
        darkMain: '#3EA6FF'
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
} satisfies Config

