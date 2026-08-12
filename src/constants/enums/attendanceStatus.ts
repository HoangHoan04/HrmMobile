import { enumData } from "@/constants/enums/enumData";

export type AttendanceStatusCode =
  "ON_TIME" | "LATE" | "EARLY" | "LEAVE" | "ABSENT" | "INCOMPLETE";

export type AttendanceStatusItem =
  (typeof enumData.ATTENDANCE_STATUS)[keyof typeof enumData.ATTENDANCE_STATUS];

const BY_CODE = Object.values(enumData.ATTENDANCE_STATUS).reduce(
  (acc, item) => {
    acc[item.code as AttendanceStatusCode] = item;
    return acc;
  },
  {} as Record<AttendanceStatusCode, AttendanceStatusItem>,
);

export function isAttendanceStatusCode(
  value: unknown,
): value is AttendanceStatusCode {
  return typeof value === "string" && value in BY_CODE;
}

export function resolveAttendanceStatus(
  status?: string | null,
): AttendanceStatusItem | null {
  if (!isAttendanceStatusCode(status)) return null;
  return BY_CODE[status];
}

export function getAttendanceStatusColor(
  status?: string | null,
): string | null {
  return resolveAttendanceStatus(status)?.color ?? null;
}

export function getAttendanceStatusBg(status?: string | null): string | null {
  return resolveAttendanceStatus(status)?.bg ?? null;
}

export function getAttendanceStatusLabelKey(
  status?: string | null,
): string | null {
  return resolveAttendanceStatus(status)?.labelKey ?? null;
}

export const ATTENDANCE_STATUS_OPTIONS = Object.values(
  enumData.ATTENDANCE_STATUS,
);
