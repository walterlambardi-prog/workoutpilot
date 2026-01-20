/**
 * Initialize Reactotron in development mode (native only)
 * This file is imported at app startup to set up debugging tools
 */
if (
  __DEV__ &&
  typeof navigator !== "undefined" &&
  navigator.product === "ReactNative"
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./reactotron");
}

// Empty export to make this a module
export { };

