import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import { create } from "zustand";

type AppTheme = "light" | "dark";

interface ThemeState {
  theme: AppTheme;
  initTheme: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
}

function applyStatusBarStyle(theme: AppTheme) {
  StatusBar.setBarStyle(
    theme === "dark" ? "light-content" : "dark-content",
    true,
  );
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  initTheme: async () => {
    const saved = await AsyncStorage.getItem("theme");
    const theme: AppTheme = saved === "dark" ? "dark" : "light";
    applyStatusBarStyle(theme);
    set({ theme });
  },
  setTheme: async (theme) => {
    await AsyncStorage.setItem("theme", theme);
    applyStatusBarStyle(theme);
    set({ theme });
  },
}));
