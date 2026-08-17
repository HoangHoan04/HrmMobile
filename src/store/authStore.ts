import { isNetworkError } from "@/features/common/apiError";
import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
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
  /** Sau login: tạm bỏ heavy /profile để Home ưu tiên attendance */
  skipHeavyProfile: boolean;
  initializeAuth: () => Promise<void>;
  login: (token: string, rfToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  allowHeavyProfile: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setSessionExpiredHandler(async () => {
    if (!get().isAuthenticated && !get().accessToken) return;
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      skipHeavyProfile: false,
    });
  });

  setTokenRefreshedHandler((accessToken) => {
    // Wave B5: đồng bộ user (roles/permissions) sau refresh
    const user = tokenCache.getUser();
    set({
      accessToken,
      isAuthenticated: true,
      ...(user ? { user } : {}),
    });
  });

  return {
    isAuthenticated: false,
    isInitialized: false,
    accessToken: null,
    user: null,
    onboardingCompleted: false,
    skipHeavyProfile: false,

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
            // Wave A: cold start dùng light /me (không attendance / org graph)
            const { data } = await rootApi.get(endpoints.auth.me, {
              skipErrorToast: true,
            } as any);

            const nextUser = {
              ...user,
              username: data?.username ?? user.username,
              type: data?.type ?? user.type,
              email: data?.email ?? user.email,
              fullName: data?.fullName ?? user.fullName,
              avatarUrl: data?.avatarUrl ?? user.avatarUrl,
              employeeId: data?.employeeId ?? user.employeeId,
              companyId: data?.companyId ?? user.companyId,
              branchId: data?.branchId ?? user.branchId,
              roles: Array.isArray(data?.roles) ? data.roles : user.roles,
              permissions: Array.isArray(data?.permissions)
                ? data.permissions
                : user.permissions,
            };
            await tokenCache.setUser(nextUser);

            set({
              isAuthenticated: true,
              accessToken: tokenCache.getAccessToken() || token,
              user: nextUser,
              onboardingCompleted,
              skipHeavyProfile: false,
            });
          } catch (error: any) {
            if (isNetworkError(error)) {
              set({
                isAuthenticated: true,
                accessToken: token,
                user,
                onboardingCompleted,
                skipHeavyProfile: false,
              });
              return;
            }

            const status = error?.response?.status;
            if (status === 401 || status === 403 || status === 404) {
              if (status === 403) {
                showToastError(
                  getApiErrorMessage(error, "login.noMobileAccess"),
                );
              }
              await tokenCache.clear();
              set({
                isAuthenticated: false,
                accessToken: null,
                user: null,
                onboardingCompleted,
                skipHeavyProfile: false,
              });
              return;
            }

            set({
              isAuthenticated: true,
              accessToken: token,
              user,
              onboardingCompleted,
              skipHeavyProfile: false,
            });
          }
        } else {
          await tokenCache.clear();
          set({
            isAuthenticated: false,
            accessToken: null,
            user: null,
            onboardingCompleted,
            skipHeavyProfile: false,
          });
        }
      } catch {
        await tokenCache.clear();
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          skipHeavyProfile: false,
        });
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
          // Skip heavy /profile ngay sau login — Home dùng login payload + attendance
          skipHeavyProfile: true,
        });
        setTimeout(() => {
          if (get().isAuthenticated) set({ skipHeavyProfile: false });
        }, 2500);
      } catch {
        //! Ignore SecureStore write errors for now.
      }
    },

    allowHeavyProfile: () => set({ skipHeavyProfile: false }),

    logout: async () => {
      try {
        await tokenCache.clear();
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          skipHeavyProfile: false,
        });
      } catch {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          skipHeavyProfile: false,
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
        //! Ignore
      }
    },
  };
});
