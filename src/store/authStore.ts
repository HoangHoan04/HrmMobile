import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import tokenCache from "@/utils/token";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  accessToken: string | null;
  user: any | null;
  onboardingCompleted: boolean;
  initializeAuth: () => Promise<void>;
  login: (token: string, rfToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,
  user: null,
  onboardingCompleted: false,

  initializeAuth: async () => {
    try {
      await tokenCache.loadFromStorage();
      const token = tokenCache.getAccessToken();
      const rfToken = tokenCache.getRefreshToken();
      const user = tokenCache.getUser();
      const onboardingVal = await AsyncStorage.getItem("ONBOARDING_COMPLETED");

      if (token && rfToken && user) {
        try {
          await rootApi.get(endpoints.auth.me, { skipErrorToast: true } as any);
          set({
            isAuthenticated: true,
            accessToken: token,
            user,
            onboardingCompleted: onboardingVal === "true",
          });
        } catch {
          await tokenCache.clear();
          set({
            isAuthenticated: false,
            accessToken: null,
            user: null,
            onboardingCompleted: onboardingVal === "true",
          });
        }
      } else {
        await tokenCache.clear();
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          onboardingCompleted: onboardingVal === "true",
        });
      }
    } catch (e) {
      await tokenCache.clear();
      set({ isAuthenticated: false, accessToken: null, user: null });
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (token: string, rfToken: string, user: any) => {
    try {
      await tokenCache.setAuthData(token, rfToken, user);
      const onboardingVal = await AsyncStorage.getItem("ONBOARDING_COMPLETED");
      set({
        isAuthenticated: true,
        accessToken: token,
        user,
        onboardingCompleted: onboardingVal === "true",
      });
    } catch (e) {
      //! Handle error if needed
    }
  },

  logout: async () => {
    try {
      await tokenCache.clear();
      await AsyncStorage.removeItem("ONBOARDING_COMPLETED");
      set({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        onboardingCompleted: false,
      });
    } catch (e) {
      //! Handle error if needed
    }
  },

  setOnboardingCompleted: async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(
        "ONBOARDING_COMPLETED",
        completed ? "true" : "false",
      );
      set({ onboardingCompleted: completed });
    } catch (e) {
      //! Handle error if needed
    }
  },
}));
