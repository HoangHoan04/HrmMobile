import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_PORT = 5036;
const API_PREFIX = "/api/v1";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function getExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).linkingUri;

  if (!hostUri || typeof hostUri !== "string") return null;

  const cleaned = hostUri.replace(/^exp:\/\//, "").replace(/^https?:\/\//, "");
  const host = cleaned.split("/")[0]?.split(":")[0]?.trim();
  if (!host) return null;
  if (host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

export function getApiBaseUrl(): string {
  if (__DEV__) {
    const expoHost = getExpoDevHost();
    if (expoHost) {
      return `http://${expoHost}:${DEFAULT_PORT}${API_PREFIX}`;
    }

    const configured = process.env.EXPO_PUBLIC_API
      ? stripQuotes(process.env.EXPO_PUBLIC_API)
      : "";
    if (configured) {
      return normalizeBaseUrl(configured);
    }

    const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
    return `http://${host}:${DEFAULT_PORT}${API_PREFIX}`;
  }

  const configured = process.env.EXPO_PUBLIC_API
    ? stripQuotes(process.env.EXPO_PUBLIC_API)
    : "";
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  throw new Error(
    "EXPO_PUBLIC_API is not configured. Set it in HrmMobile/.env",
  );
}

export function logApiConfig(): void {
  console.log(
    `[Mobile API] platform=${Platform.OS} baseURL=${getApiBaseUrl()} expoHost=${getExpoDevHost() ?? "n/a"} envApi=${process.env.EXPO_PUBLIC_API ?? "n/a"}`,
  );
}
