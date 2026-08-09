import Helper from "@/helper/helpers";
import { showToastError } from "@/helper/ToastEventEmitter";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import * as Updates from "expo-updates";
import { endpoints } from "./endpoint";

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

const initApi = (url?: string, headers = {}) => {
  if (!url) throw new Error("URL is required");
  const { runtimeVersion, createdAt } = Updates;
  const requestNoToken = axios.create({
    baseURL: url,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const refreshToken = async (): Promise<string> => {
    const rfToken = await Helper.getRfToken();
    if (!rfToken) throw new Error("No refresh token");

    const { data } = await requestNoToken.post(endpoints.auth.refreshToken, {
      refreshToken: rfToken,
    });

    const accessToken = data?.token || data?.accessToken;
    if (!accessToken) {
      throw new Error("Invalid refresh response");
    }

    await Helper.saveToken(accessToken);
    if (data.refreshToken) {
      await Helper.saveRfToken(data.refreshToken);
    }

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

  api.interceptors.request.use(async (config) => {
    const token = await Helper.getToken();
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
      const hasAuthHeader =
        originalRequest.headers &&
        (originalRequest.headers.Authorization ||
          originalRequest.headers.authorization);

      if (
        (status === 401 || status === 403) &&
        !originalRequest._retry &&
        hasAuthHeader
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers!.Authorization = `Bearer ${token}`;
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
          originalRequest.headers!.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          await Helper.clearDataLogin();
          showToastError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      if (originalRequest.skipErrorToast) {
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
