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
  totalDays: number;
  reason?: string | null;
  status: string;
  approverId?: string | null;
  approverName?: string | null;
  approvedAt?: string | null;
  approverNote?: string | null;
  createdAt?: string;
}

export interface CreateLeavePayload {
  dayOffType: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  dayOffConfigId?: string | null;
}

export interface MobileLeaveConfigDto {
  id: string;
  code: string;
  name: string;
  dayOffType: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
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
