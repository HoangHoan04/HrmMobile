export type AttendanceStatusCode =
  | "ON_TIME"
  | "LATE"
  | "EARLY"
  | "LEAVE"
  | "ABSENT"
  | "INCOMPLETE";

export interface MobileTodayDto {
  workDate: string;
  status: AttendanceStatusCode;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  lateMinutes?: number;
  earlyMinutes?: number;
  workedMinutes?: number;
  note?: string | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  onLeave: boolean;
  expectedStart?: string | null;
  expectedEnd?: string | null;
  branchName?: string | null;
  allowedRadiusMeters?: number;
}

export interface MobileMonthDayDto {
  workDate: string;
  status: AttendanceStatusCode;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  workedMinutes?: number;
  workedHours?: number | null;
  lateMinutes?: number;
  earlyMinutes?: number;
  note?: string | null;
}

export interface MobileMonthDto {
  year: number;
  month: number;
  days: MobileMonthDayDto[];
  onTimeDays: number;
  lateDays: number;
  earlyDays: number;
  leaveDays: number;
  absentDays: number;
  incompleteDays: number;
  totalWorkedMinutes: number;
  expectedWorkingDays?: number;
  dailyExpectedMinutes?: number;
  expectedWorkedMinutes?: number;
}
