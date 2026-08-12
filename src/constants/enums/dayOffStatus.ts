import { enumData } from "@/constants/enums/enumData";

export type DayOffStatusCode =
  "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type DayOffStatusItem =
  (typeof enumData.DAY_OFF_STATUS)[keyof typeof enumData.DAY_OFF_STATUS];

const BY_CODE = Object.values(enumData.DAY_OFF_STATUS).reduce(
  (acc, item) => {
    acc[item.code as DayOffStatusCode] = item;
    return acc;
  },
  {} as Record<DayOffStatusCode, DayOffStatusItem>,
);

export function isDayOffStatusCode(value: unknown): value is DayOffStatusCode {
  return typeof value === "string" && value in BY_CODE;
}

export function resolveDayOffStatus(status?: string | null): DayOffStatusItem {
  const key = typeof status === "string" ? status.toUpperCase() : "";
  if (isDayOffStatusCode(key)) return BY_CODE[key];
  return enumData.DAY_OFF_STATUS.PENDING;
}

export function getDayOffStatusLabelKey(status?: string | null): string {
  return resolveDayOffStatus(status).labelKey;
}

export const DAY_OFF_STATUS_OPTIONS = Object.values(enumData.DAY_OFF_STATUS);

export const DAY_OFF_STATUS = enumData.DAY_OFF_STATUS;
