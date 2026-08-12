export const PermissionCodes = {
  OrgView: "ORG_VIEW",
  OrgManage: "ORG_MANAGE",
  EmployeeView: "EMPLOYEE_VIEW",
  TimekeepingView: "TIMEKEEPING_VIEW",
  TimekeepingAdjust: "TIMEKEEPING_ADJUST",
  LeaveView: "LEAVE_VIEW",
  LeaveCreate: "LEAVE_CREATE",
  LeaveApprove: "LEAVE_APPROVE",
  LeaveManage: "LEAVE_MANAGE",
  AttendanceComplaintView: "ATTENDANCE_COMPLAINT_VIEW",
  AttendanceComplaintCreate: "ATTENDANCE_COMPLAINT_CREATE",
  AttendanceComplaintReview: "ATTENDANCE_COMPLAINT_REVIEW",
  PayrollView: "PAYROLL_VIEW",
  RoleView: "ROLE_VIEW",
  RoleManage: "ROLE_MANAGE",
  UserView: "USER_VIEW",
  UserManage: "USER_MANAGE",
  MobileAccess: "MOBILE_ACCESS",
} as const;

export type PermissionCode =
  (typeof PermissionCodes)[keyof typeof PermissionCodes];

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === "string" && !!x.trim())
    .map((x) => x.trim());
}
