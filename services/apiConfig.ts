import { Platform } from "react-native";

const DEFAULT_PORT = 5036;
const API_PREFIX = "/api/v1";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Resolve API base URL for the current runtime.
 * - Physical device: use EXPO_PUBLIC_API (LAN IP of dev machine)
 * - Android emulator: 10.0.2.2 maps to host localhost
 * - iOS simulator: localhost works when API binds 0.0.0.0:5036
 */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (__DEV__) {
    const host =
      Platform.OS === "android" ? "10.0.2.2" : "localhost";
    return `http://${host}:${DEFAULT_PORT}${API_PREFIX}`;
  }

  throw new Error(
    "EXPO_PUBLIC_API is not configured. Set it in HrmMobile/.env",
  );
}

export function logApiConfig(): void {
  console.log(
    `[Mobile API] platform=${Platform.OS} baseURL=${getApiBaseUrl()}`,
  );
}
