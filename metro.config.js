// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add Tamagui plugin for optimized compilation
const { withTamagui } = require("@tamagui/metro-plugin");

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui.css",
  // Improve performance with tree-shaking
  importsWhitelist: ["constants.js", "colors.js"],
  logTimings: true,
  disableExtraction: process.env.NODE_ENV === "development",
});
