const { createJSONStorage } = require("zustand/middleware");

const hasLocalStorage = typeof window !== "undefined" && !!window.localStorage;

const safeAccess = <T>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch (error) {
    console.warn("[storage] Local storage access failed", error);
    return fallback;
  }
};

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
        return safeAccess(() => window.localStorage.getItem(name), null);
      }
      const AsyncStorage = await getAsyncStorage();
      return AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string) => {
      if (hasLocalStorage) {
        safeAccess(() => window.localStorage.setItem(name, value), undefined);
        return;
      }
      const AsyncStorage = await getAsyncStorage();
      await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
      if (hasLocalStorage) {
        safeAccess(() => window.localStorage.removeItem(name), undefined);
        return;
      }
      const AsyncStorage = await getAsyncStorage();
      await AsyncStorage.removeItem(name);
    },
  }));
};
