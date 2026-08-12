import moment from "moment";

export function formatNumericInput(val: any) {
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
}

export function formatDateTime(text: Date | string | number | undefined) {
  if (!text) return "";
  return moment(text).format("HH:mm DD/MM/YY");
}

export function formatDate(
  text: Date | string | number | undefined,
  format?: string,
) {
  if (!text) return "";
  return moment(text).format(format ? format : "DD/MM/YY");
}

export function formatMoneyD(money?: number | string) {
  if (!!money || money == 0) {
    if (money && money.toString().length > 0) {
      return money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ";
    } else {
      return money + "đ";
    }
  } else {
    return "0đ";
  }
}

export function formatMoneyVND(money: number) {
  if (!!money || money == 0) {
    if (money && money.toString().length > 0) {
      return (
        money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + " VND"
      );
    } else {
      return money + " VND";
    }
  } else {
    return "0 VND";
  }
}

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

export const getLocalizedDate = (language: "vi" | "en" = "vi"): string => {
  const now = new Date();
  const date = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  if (language === "en") {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${date}`;
  }

  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  return `${days[now.getDay()]}, ngày ${date} Tháng ${month}`;
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function formatClock(value?: string | null): string {
  if (!value) return "--:--";
  if (/^\d{1,2}:\d{2}/.test(value) && !value.includes("T")) {
    const [h, m] = value.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function toDateOnly(date: Date): string {
  return moment(date).format("YYYY-MM-DD");
}

export function parseHhMmToTimeSpan(value: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function clockOrEmpty(value?: string | null): string {
  if (!value || value === "--:--") return "";
  return value;
}
