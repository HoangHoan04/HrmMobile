import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  initTheme: () => Promise<void>;
  setTheme: (theme: "light" | "dark") => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  initTheme: async () => {
    const saved = await AsyncStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      set({ theme: saved });
    } else {
      set({ theme: "light" });
    }
  },
  setTheme: async (theme) => {
    await AsyncStorage.setItem("theme", theme);
    set({ theme });
  },
}));
