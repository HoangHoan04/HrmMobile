import { enumData } from "@/constants/enums/enumData";

export type DayOffTypeCode =
  "ANNUAL" | "SICK" | "UNPAID" | "MATERNITY" | "PATERNITY" | "OTHER";

export type DayOffTypeItem =
  (typeof enumData.DAY_OFF_TYPE)[keyof typeof enumData.DAY_OFF_TYPE];

const BY_CODE = Object.values(enumData.DAY_OFF_TYPE).reduce(
  (acc, item) => {
    acc[item.code as DayOffTypeCode] = item;
    return acc;
  },
  {} as Record<DayOffTypeCode, DayOffTypeItem>,
);

export function isDayOffTypeCode(value: unknown): value is DayOffTypeCode {
  return typeof value === "string" && value in BY_CODE;
}

export function resolveDayOffType(type?: string | null): DayOffTypeItem {
  const key = typeof type === "string" ? type.toUpperCase() : "";
  if (isDayOffTypeCode(key)) return BY_CODE[key];
  return enumData.DAY_OFF_TYPE.OTHER;
}

export function getDayOffTypeLabelKey(type?: string | null): string {
  return resolveDayOffType(type).labelKey;
}

export const DAY_OFF_TYPE_OPTIONS = Object.values(enumData.DAY_OFF_TYPE);

export const DAY_OFF_TYPE = enumData.DAY_OFF_TYPE;
