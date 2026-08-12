import { DeviceEventEmitter } from "react-native";

const TOAST_DEDUPE_MS = 2500;
let lastErrorToast = "";
let lastErrorToastAt = 0;

export const showToast = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToast", message, data);
};

export const showToastError = (message: string, data?: any) => {
  const now = Date.now();
  if (
    message &&
    message === lastErrorToast &&
    now - lastErrorToastAt < TOAST_DEDUPE_MS
  ) {
    return;
  }
  lastErrorToast = message || "";
  lastErrorToastAt = now;
  DeviceEventEmitter.emit("showToastError", message, data);
};

export const showToastInfo = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToastInfo", message, data);
};

export const showToastSuccess = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToastSuccess", message, data);
};

export const showToastCustom = (
  data: {
    title?: string;
    message: string;
    type: "ERROR" | "SUCCESS" | "WARN" | "INFO";
  } = { title: "Thông báo", message: "", type: "SUCCESS" },
) => {
  DeviceEventEmitter.emit("showToastCustom", data);
};

export const listenForToast = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener("showToast", callback);
  return () => subscription.remove();
};

export const listenForToastError = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastError",
    callback,
  );
  return () => subscription.remove();
};

export const listenForToastInfo = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastInfo",
    callback,
  );
  return () => subscription.remove();
};

export const listenForToastSuccess = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastSuccess",
    callback,
  );
  return () => subscription.remove();
};
