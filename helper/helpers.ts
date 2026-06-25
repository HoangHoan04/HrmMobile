import * as SecureStore from "expo-secure-store";
import moment from "moment";
import { ACCESS_TOKEN, RF_TOKEN, USER_LOGIN } from "./keys";

export enum EKeyCheck {
  STRING,
  THAN_ZERO,
  THAN_EQ_ZERO,
  LESS_ZERO,
  LESS_EQ_ZERO,
}

export const formatNumericInput = (val: any) => {
  const text = val?.toString() || "";
  if (!text) return "";
  const withDot = text.replace(/,/g, ".");
  if (withDot.endsWith(".")) {
    const beforeDot = withDot.slice(0, -1);
    if (!beforeDot.includes(".")) {
      return withDot;
    }
  }
  const sanitized = withDot.replace(/[^\d.-]/g, "");
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  if (sanitized.startsWith("-")) {
    return "-" + sanitized.substring(1).replace(/-/g, "");
  }
  return sanitized;
};

const Helper = {
  formatVND: (money: number, prefix = "đ") => {
    return new Intl.NumberFormat("vi-VN").format(money || 0) + " " + prefix;
  },
  saveToken: async (value: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN, value);
  },

  saveIsPayment: async (value: boolean) => {
    await SecureStore.setItemAsync("isPayment", value.toString());
  },
  clearIsPayment: async () => {
    await SecureStore.deleteItemAsync("isPayment");
  },
  getIsPayment: async () => {
    return await SecureStore.getItemAsync("isPayment");
  },
  saveUserLoginData: async (value: { username: string; password: string }) => {
    await SecureStore.setItemAsync(USER_LOGIN, JSON.stringify(value));
  },
  getUserLoginData: async () => {
    return await SecureStore.getItemAsync(USER_LOGIN);
  },
  getToken: async () => {
    let result = await SecureStore.getItemAsync(ACCESS_TOKEN);
    return result;
  },
  getRfToken: async () => {
    let result = await SecureStore.getItemAsync(RF_TOKEN);
    return result;
  },
  saveRfToken: async (value: string) => {
    await SecureStore.setItemAsync(RF_TOKEN, value);
  },
  clearDataLogin: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(USER_LOGIN);
    await SecureStore.deleteItemAsync(RF_TOKEN);
  },

  verifyField: (object: any, checkType: EKeyCheck[]) => {
    let missingFiled: string[] = [];
    Object.keys(object).map((key) => {
      if (checkType.includes(EKeyCheck.STRING) && !object[key]) {
        missingFiled.push(key);
      }
    });
    return missingFiled;
  },
};

export default Helper;

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatNumber = (value: number | string, useEn?: boolean) => {
  if (value === null || value === undefined || value === "") return "";
  let raw = value.toString().trim();
  if (!useEn) {
    raw = raw.replace(",", ".");
  }
  const num = Number(raw);
  if (isNaN(num)) return value as any;

  const hasFraction = Math.abs(num % 1) > 0;

  return new Intl.NumberFormat(useEn ? "en-US" : "vi-VN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(num);
};

export const checkAccountNameBankValid = (accountName: string) => {
  const regex = /^[A-Z\s]+$/;
  return regex.test(accountName);
};

export const checkAccountNumberBankValid = (accountName: string) => {
  const regex = /^[A-Z0-9]+$/;
  return regex.test(accountName);
};

export const formatDate = (
  date: Date,
  format: string = "DD/MM/YYYY",
): string => {
  return moment(date).format(format);
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const summaryChaFromStr = (str: string): string => {
  const words = str.trim().split(/\s+/);
  const abbreviation = words
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return abbreviation;
};

export const getLastWords = (str: string | null | undefined): string => {
  if (!str) return "";
  return str.split(" ").slice(-1)[0] || "";
};

export const sortArr = (arr: any[], key: string): any[] => {
  return arr
    ? arr
        .sort((a: any, b: any) => a?.name?.localeCompare(b.name))
        .map((item: any) => ({
          ...item,
          equipments: item[key]?.sort((a: any, b: any) =>
            a.name.localeCompare(b.name),
          ),
        }))
    : [];
};
