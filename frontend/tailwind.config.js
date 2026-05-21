export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        brand: {
          dark: '#080C14',        // Deep Obsidian Canvas
          card: 'rgba(15, 23, 42, 0.45)', // Translucent Frosted Glass
          cardSolid: '#0F172A',   // Solid slate gray card
          border: 'rgba(255, 255, 255, 0.06)', // Frosted glass border
          borderHover: 'rgba(255, 255, 255, 0.12)', // Active glowing border
          primary: '#F59E0B',     // Amber Honey/Citrus
          primaryHover: '#D97706',
          secondary: '#10B981',   // Emerald Mint Green
          secondaryHover: '#059669',
          accent: '#EF4444',      // Coral Rose Red
          textMain: '#F8FAFC',    // Slate Off-White
          textMuted: '#94A3B8',   // Slate Gray Muted
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 32px 0 rgba(245, 158, 11, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 12px 2px rgba(245, 158, 11, 0.05)' },
          '100%': { boxShadow: '0 0 24px 6px rgba(245, 158, 11, 0.18)' },
        }
      }
    },
  },
  plugins: [],
}
