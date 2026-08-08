import { getApiBaseUrl } from "@/services/apiConfig";

export const AppEnv = {
  apiUrl: getApiBaseUrl(),
  name: process.env.EXPO_PUBLIC_APP_VARIANT || "development",
};
