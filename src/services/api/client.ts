import { t } from "@/features/common";
import { isNetworkError } from "@/features/common/apiError";
import { showToastError } from "@/helper/ToastEventEmitter";
import tokenCache from "@/utils/token";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import * as Updates from "expo-updates";
import { endpoints } from "./endpoints";
import { notifySessionExpired, notifyTokenRefreshed } from "./sessionBridge";

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

function isAuthRefreshUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes(endpoints.auth.refreshToken) ||
    url.includes(endpoints.auth.login)
  );
}

function hasAuthorizationHeader(
  headers: AxiosRequestConfig["headers"],
): boolean {
  if (!headers) return false;
  const anyHeaders = headers as Record<string, unknown>;
  return !!(anyHeaders.Authorization || anyHeaders.authorization);
}

const initApi = (url?: string, headers = {}) => {
  if (!url) throw new Error("URL is required");
  const { runtimeVersion, createdAt } = Updates;
  const requestNoToken = axios.create({
    baseURL: url,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const refreshToken = async (): Promise<string> => {
    const rfToken = tokenCache.getRefreshToken();
    if (!rfToken) throw new Error("No refresh token");

    const { data } = await requestNoToken.post(endpoints.auth.refreshToken, {
      refreshToken: rfToken,
    });

    const accessToken = data?.token || data?.accessToken || data?.Token;
    if (!accessToken) {
      throw new Error("Invalid refresh response");
    }

    const nextRfToken = data.refreshToken || data.RefreshToken || rfToken;
    const currentUser = tokenCache.getUser() || {};
    // Wave B5: sync roles/permissions từ refresh body
    const nextUser = {
      ...currentUser,
      roles: Array.isArray(data?.roles) ? data.roles : currentUser.roles,
      permissions: Array.isArray(data?.permissions)
        ? data.permissions
        : currentUser.permissions,
      type: data?.type ?? currentUser.type,
      username: data?.username ?? currentUser.username,
    };
    await tokenCache.setAuthData(accessToken, nextRfToken, nextUser);
    notifyTokenRefreshed(accessToken);

    return accessToken;
  };

  const api = axios.create({
    baseURL: url,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      ...headers,
      version: runtimeVersion,
      environment: process.env.EXPO_PUBLIC_APP_VARIANT,
      updateDate: createdAt?.toString() || "2024-11-11",
    },
  });

  api.interceptors.request.use((config) => {
    const token = tokenCache.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
        skipErrorToast?: boolean;
      };

      const status =
        error.response?.status || (error.response?.data as any)?.httpCode;
      const canTryRefresh =
        !!tokenCache.getRefreshToken() &&
        !isAuthRefreshUrl(originalRequest?.url) &&
        (hasAuthorizationHeader(originalRequest?.headers) ||
          !!tokenCache.getAccessToken());

      if (
        (status === 401 || status === 403) &&
        !originalRequest?._retry &&
        canTryRefresh
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers = originalRequest.headers || {};
                (originalRequest.headers as any).Authorization =
                  `Bearer ${token}`;
                resolve(api(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          processQueue(null, newToken);
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);

          if (isNetworkError(err)) {
            showToastError(t("common.serverUnavailable"));
            return Promise.reject(err);
          }

          await tokenCache.clear();
          await notifySessionExpired();
          if (!originalRequest?.skipErrorToast) {
            showToastError(
              "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!",
            );
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      if (
        (status === 401 || status === 403) &&
        !tokenCache.getRefreshToken() &&
        tokenCache.getAccessToken()
      ) {
        await tokenCache.clear();
        await notifySessionExpired();
      }

      if (isNetworkError(error)) {
        showToastError(t("common.serverUnavailable"));
        return Promise.reject(error);
      }

      if (originalRequest?.skipErrorToast) {
        return Promise.reject(error);
      }

      const responseData = error.response?.data as any;
      const apiMessage =
        (typeof responseData === "string" && responseData) ||
        responseData?.message ||
        responseData?.title ||
        null;

      showToastError(
        typeof apiMessage === "string" && apiMessage.trim()
          ? apiMessage
          : "Có lỗi xảy ra, vui lòng thử lại!",
      );

      return Promise.reject(error);
    },
  );

  return api;
};

export default initApi;
