import { enumData } from "@/constants/enums/enumData";

export type LeaveSession =
  | typeof enumData.LEAVE_SESSION.FULL.value
  | typeof enumData.LEAVE_SESSION.AM.value
  | typeof enumData.LEAVE_SESSION.PM.value;

export interface RegisterDayOffDto {
  id: string;
  employeeId?: string;
  employeeName?: string | null;
  employeeCode?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  dayOffConfigId?: string | null;
  dayOffConfigName?: string | null;
  dayOffType: string;
  fromDate: string;
  toDate: string;
  session?: LeaveSession | string | null;
  totalDays: number;
  reason?: string | null;
  attachmentUrl?: string | null;
  status: string;
  requestedApproverId?: string | null;
  requestedApproverName?: string | null;
  approverId?: string | null;
  approverName?: string | null;
  approvedAt?: string | null;
  approverNote?: string | null;
  cancelReason?: string | null;
  createdAt?: string;
}

export interface CreateLeavePayload {
  dayOffType: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  session?: LeaveSession;
  dayOffConfigId?: string | null;
  attachmentUrl?: string | null;
}

export interface PreviewLeaveDaysDto {
  totalDays: number;
  saturdayPolicy?: string | null;
  session?: LeaveSession | string | null;
  fromDate?: string;
  toDate?: string;
}

export interface MobileLeaveConfigDto {
  id: string;
  code: string;
  name: string;
  dayOffType: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  deductBalance: boolean;
  requireAttachment: boolean;
  maxDaysPerRequest: number | null;
  minNoticeDays: number;
}

export interface MobileLeaveBalanceDto {
  year: number;
  annualTotal: number;
  annualUsed: number;
  annualPending: number;
  annualRemaining: number;
  sickUsed: number;
  unpaidUsed: number;
  configs: MobileLeaveConfigDto[];
}

export interface DecideLeavePayload {
  id: string;
  approverNote?: string | null;
}
