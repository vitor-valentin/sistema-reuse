export default {
  content: ["./**/*.{html,js}"],

  theme: {
    extend: {
      colors: {
        // LIGHT THEME
        light: {
          bg: "#FFFFFF",
          text: "#0B1B3A",
          primary: "#2563EB",
          border: "#D1D5DB",
          muted: "#6B7280",
        },

        // DARK THEME
        dark: {
          bg: "#252D42",
          text: "#FFFFFF",
          primary: "#3B82F6",
          border: "#1F2933",
          muted: "#9CA3AF",
        },
      },
    },
  },

  plugins: [],
};