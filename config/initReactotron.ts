/**
 * Initialize Reactotron in development mode (native only)
 * This file is imported at app startup to set up debugging tools
 */
export const initializeReactotron = () => {
  if (
    __DEV__ &&
    typeof navigator !== "undefined" &&
    navigator.product === "ReactNative"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./reactotron");
  }
};

initializeReactotron();
