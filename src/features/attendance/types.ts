export type AttendanceStatusCode =
  "ON_TIME" | "LATE" | "EARLY" | "LEAVE" | "ABSENT" | "INCOMPLETE";

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
  expectedBreakStart?: string | null;
  expectedBreakEnd?: string | null;
  breakMinutes?: number;
  isScheduledWorkDay?: boolean;
  scheduleSource?: string | null;
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

export type AttendanceComplaintType =
  | "FORGOT_CHECK_IN"
  | "FORGOT_CHECK_OUT"
  | "FORGOT_BOTH"
  | "WRONG_TIME"
  | "OTHER";

export type AttendanceComplaintStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AttendanceComplaintDto {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  workDate: string;
  complaintType: AttendanceComplaintType;
  requestedCheckInTime?: string | null;
  requestedCheckOutTime?: string | null;
  reason: string;
  status: AttendanceComplaintStatus;
  approverNote?: string | null;
  createdAt?: string;
}

export interface CreateAttendanceComplaintPayload {
  workDate: string;
  complaintType: AttendanceComplaintType;
  requestedCheckInTime?: string | null;
  requestedCheckOutTime?: string | null;
  reason: string;
  attachmentUrl?: string | null;
}
