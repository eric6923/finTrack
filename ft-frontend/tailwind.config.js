const {nextui} = require('@nextui-org/theme');
module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(date-picker|button|ripple|spinner|calendar|date-input|form|popover).js"
  ],
  theme: {
    extend: {
      colors: {
        "dark-purple": "#081A51",
        "light-white": "rgba(255,255,255,0.17)",
      },
    },
  },
  plugins: [nextui()],
};
