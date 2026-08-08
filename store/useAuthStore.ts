import Helper from "@/helper/helpers";
import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
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
      const token = await Helper.getToken();
      const rfToken = await Helper.getRfToken();
      const userStr = await SecureStore.getItemAsync("USER_PROFILE");
      const onboardingVal = await AsyncStorage.getItem("ONBOARDING_COMPLETED");

      if (token && rfToken && userStr) {
        try {
          await rootApi.get(endpoints.auth.me, { skipErrorToast: true } as any);
          set({
            isAuthenticated: true,
            accessToken: token,
            user: JSON.parse(userStr),
            onboardingCompleted: onboardingVal === "true",
          });
        } catch {
          await Helper.clearDataLogin();
          await SecureStore.deleteItemAsync("USER_PROFILE");
          set({
            isAuthenticated: false,
            accessToken: null,
            user: null,
            onboardingCompleted: onboardingVal === "true",
          });
        }
      } else {
        await Helper.clearDataLogin();
        await SecureStore.deleteItemAsync("USER_PROFILE");
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          onboardingCompleted: onboardingVal === "true",
        });
      }
    } catch (e) {
      await Helper.clearDataLogin();
      set({ isAuthenticated: false, accessToken: null, user: null });
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (token: string, rfToken: string, user: any) => {
    try {
      await Helper.saveToken(token);
      await Helper.saveRfToken(rfToken);
      await SecureStore.setItemAsync("USER_PROFILE", JSON.stringify(user));
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
      await Helper.clearDataLogin();
      await SecureStore.deleteItemAsync("USER_PROFILE");
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
