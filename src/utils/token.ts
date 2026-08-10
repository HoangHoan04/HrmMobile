import * as SecureStore from "expo-secure-store";

interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "RF_TOKEN",
  USER: "USER_PROFILE",
};

class TokenCache {
  private cache: TokenData = {
    accessToken: null,
    refreshToken: null,
    user: null,
  };

  async loadFromStorage(): Promise<void> {
    try {
      this.cache.accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
      );
      this.cache.refreshToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN,
      );
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      this.cache.user =
        userStr && userStr !== "undefined" && userStr !== "null"
          ? JSON.parse(userStr)
          : null;
    } catch (error) {
      await this.clear();
      console.error("Failed to load tokens from SecureStore:", error);
    }
  }

  async setAuthData(
    accessToken: string,
    refreshToken: string,
    user: any,
  ): Promise<void> {
    try {
      this.cache.accessToken = accessToken;
      this.cache.refreshToken = refreshToken;
      this.cache.user = user;

      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to set auth data in SecureStore:", error);
    }
  }

  async updateUser(user: any): Promise<void> {
    try {
      this.cache.user = user;
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to update user in SecureStore:", error);
    }
  }

  async clear(): Promise<void> {
    this.cache.accessToken = null;
    this.cache.refreshToken = null;
    this.cache.user = null;
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("Failed to clear auth data from SecureStore:", error);
    }
  }

  getAccessToken(): string | null {
    return this.cache.accessToken;
  }

  getRefreshToken(): string | null {
    return this.cache.refreshToken;
  }

  getUser(): any | null {
    return this.cache.user;
  }

  async setUser(user: any): Promise<void> {
    this.cache.user = user;
    await this.updateUser(user);
  }

  isAuthenticated(): boolean {
    return !!this.cache.accessToken;
  }

  hasRefreshToken(): boolean {
    return !!this.cache.refreshToken;
  }
}

export const tokenCache = new TokenCache();
export default tokenCache;
