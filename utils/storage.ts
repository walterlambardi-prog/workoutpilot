const { createJSONStorage } = require("zustand/middleware");

const hasLocalStorage = typeof window !== "undefined" && !!window.localStorage;

const getAsyncStorage = async () => {
  const mod = await import("@react-native-async-storage/async-storage");
  return mod.default;
};

/**
 * Cross-platform storage adapter for Zustand persist middleware
 * Uses localStorage on web and AsyncStorage on native platforms
 */
export const createCrossPlatformStorage = () => {
  return createJSONStorage(() => ({
    getItem: async (name: string) => {
      if (hasLocalStorage) {
        return window.localStorage.getItem(name);
      }
      const AsyncStorage = await getAsyncStorage();
      return AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string) => {
      if (hasLocalStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
      const AsyncStorage = await getAsyncStorage();
      await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
      if (hasLocalStorage) {
        window.localStorage.removeItem(name);
        return;
      }
      const AsyncStorage = await getAsyncStorage();
      await AsyncStorage.removeItem(name);
    },
  }));
};
