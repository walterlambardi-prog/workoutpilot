import Reactotron from "reactotron-react-native";

/**
 * Configure and initialize Reactotron for debugging
 * Reactotron automatically handles connection for native and web platforms
 */
const reactotron = Reactotron.configure({
  name: "WorkoutPilot",
})
  .useReactNative({
    asyncStorage: true,
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: false,
    errors: { veto: (stackFrame) => false },
    overlay: false,
  })
  .connect();

export default reactotron;
