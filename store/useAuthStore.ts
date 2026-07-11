import Helper from "@/helper/helpers";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  accessToken: string | null;
  user: any | null;
  initializeAuth: () => Promise<void>;
  login: (token: string, rfToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,
  user: null,

  initializeAuth: async () => {
    try {
      const token = await Helper.getToken();
      const rfToken = await Helper.getRfToken();
      const userStr = await SecureStore.getItemAsync("USER_PROFILE");

      if (token && rfToken && userStr) {
        set({
          isAuthenticated: true,
          accessToken: token,
          user: JSON.parse(userStr),
        });
      } else {
        await Helper.clearDataLogin();
        await SecureStore.deleteItemAsync("USER_PROFILE");
      }
    } catch (e) {
      console.log("Error initializing auth:", e);
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (token: string, rfToken: string, user: any) => {
    try {
      await Helper.saveToken(token);
      await Helper.saveRfToken(rfToken);
      await SecureStore.setItemAsync("USER_PROFILE", JSON.stringify(user));
      set({
        isAuthenticated: true,
        accessToken: token,
        user,
      });
    } catch (e) {
      console.log("Error logging in:", e);
    }
  },

  logout: async () => {
    try {
      await Helper.clearDataLogin();
      await SecureStore.deleteItemAsync("USER_PROFILE");
      set({
        isAuthenticated: false,
        accessToken: null,
        user: null,
      });
    } catch (e) {
      console.log("Error logging out:", e);
    }
  },
}));
