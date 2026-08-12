import { isNetworkError } from "@/features/common/apiError";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import {
  setSessionExpiredHandler,
  setTokenRefreshedHandler,
} from "@/services/api/sessionBridge";
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

export const useAuthStore = create<AuthState>((set, get) => {
  setSessionExpiredHandler(async () => {
    if (!get().isAuthenticated && !get().accessToken) return;
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
    });
  });

  setTokenRefreshedHandler((accessToken) => {
    set({
      accessToken,
      isAuthenticated: true,
    });
  });

  return {
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
        const onboardingVal = await AsyncStorage.getItem(
          "ONBOARDING_COMPLETED",
        );
        const onboardingCompleted = onboardingVal === "true";

        if (token && rfToken && user) {
          try {
            await rootApi.get(endpoints.auth.me, {
              skipErrorToast: true,
            } as any);
            set({
              isAuthenticated: true,
              accessToken: tokenCache.getAccessToken() || token,
              user: tokenCache.getUser() || user,
              onboardingCompleted,
            });
          } catch (error: any) {
            if (isNetworkError(error)) {
              set({
                isAuthenticated: true,
                accessToken: token,
                user,
                onboardingCompleted,
              });
              return;
            }

            const status = error?.response?.status;
            if (status === 401 || status === 403) {
              await tokenCache.clear();
              set({
                isAuthenticated: false,
                accessToken: null,
                user: null,
                onboardingCompleted,
              });
              return;
            }

            set({
              isAuthenticated: true,
              accessToken: token,
              user,
              onboardingCompleted,
            });
          }
        } else {
          await tokenCache.clear();
          set({
            isAuthenticated: false,
            accessToken: null,
            user: null,
            onboardingCompleted,
          });
        }
      } catch {
        await tokenCache.clear();
        set({ isAuthenticated: false, accessToken: null, user: null });
      } finally {
        set({ isInitialized: true });
      }
    },

    login: async (token: string, rfToken: string, user: any) => {
      try {
        await tokenCache.setAuthData(token, rfToken, user);
        const onboardingVal = await AsyncStorage.getItem(
          "ONBOARDING_COMPLETED",
        );
        set({
          isAuthenticated: true,
          accessToken: token,
          user,
          onboardingCompleted: onboardingVal === "true",
        });
      } catch {
        //! Ignore SecureStore write errors for now.
      }
    },

    logout: async () => {
      try {
        await tokenCache.clear();
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
        });
      } catch {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
        });
      }
    },

    setOnboardingCompleted: async (completed: boolean) => {
      try {
        await AsyncStorage.setItem(
          "ONBOARDING_COMPLETED",
          completed ? "true" : "false",
        );
        set({ onboardingCompleted: completed });
      } catch {
        // Ignore
      }
    },
  };
});
