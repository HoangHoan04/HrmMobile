import { DeviceEventEmitter } from "react-native";

// Hiển thị toast thông báo
export const showToast = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToast", message, data);
};

// Hiển thị toast lỗi
export const showToastError = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToastError", message, data);
};

// Hiển thị toast thông tin
export const showToastInfo = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToastInfo", message, data);
};

// Hiển thị toast thành công
export const showToastSuccess = (message: string, data?: any) => {
  DeviceEventEmitter.emit("showToastSuccess", message, data);
};

// Hiển thị toast tùy chỉnh
export const showToastCustom = (
  data: {
    title?: string;
    message: string;
    type: "ERROR" | "SUCCESS" | "WARN" | "INFO";
  } = { title: "Thông báo", message: "", type: "SUCCESS" },
) => {
  DeviceEventEmitter.emit("showToastCustom", data);
};

// Lắng nghe toast thông báo
export const listenForToast = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener("showToast", callback);
  return () => subscription.remove();
};

// Lắng nghe toast lỗi
export const listenForToastError = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastError",
    callback,
  );
  return () => subscription.remove();
};

// Lắng nghe toast thông tin
export const listenForToastInfo = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastInfo",
    callback,
  );
  return () => subscription.remove();
};

// Lắng nghe toast thành công
export const listenForToastSuccess = (callback: (message: string) => void) => {
  const subscription = DeviceEventEmitter.addListener(
    "showToastSuccess",
    callback,
  );
  return () => subscription.remove();
};
