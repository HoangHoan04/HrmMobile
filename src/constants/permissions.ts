export const PermissionCodes = {
  OrgView: "ORGANIZATION_VIEW",
  OrgManage: "ORGANIZATION_MANAGE",
  EmployeeView: "HUMAN_RESOURCE_EMPLOYEE_VIEW",
  ContractView: "HUMAN_RESOURCE_CONTRACT_VIEW",
  TimekeepingView: "OPERATE_TIMEKEEPING_VIEW",
  TimekeepingAdjust: "OPERATE_TIMEKEEPING_ADJUST",
  OvertimeView: "OPERATE_OVERTIME_VIEW",
  OvertimeCreate: "OPERATE_OVERTIME_CREATE",
  OvertimeApprove: "OPERATE_OVERTIME_APPROVE",
  LeaveView: "OPERATE_LEAVE_VIEW",
  LeaveCreate: "OPERATE_LEAVE_CREATE",
  LeaveApprove: "OPERATE_LEAVE_APPROVE",
  LeaveManage: "OPERATE_LEAVE_MANAGE",
  AttendanceComplaintView: "OPERATE_ATTENDANCE_COMPLAINT_VIEW",
  AttendanceComplaintCreate: "OPERATE_ATTENDANCE_COMPLAINT_CREATE",
  AttendanceComplaintReview: "OPERATE_ATTENDANCE_COMPLAINT_REVIEW",
  PayrollView: "PAYROLL_VIEW",
  RoleView: "ROLE_VIEW",
  RoleManage: "ROLE_MANAGE",
  UserView: "USER_VIEW",
  UserManage: "USER_MANAGE",
  MobileAccess: "MOBILE_ACCESS",

  PerformanceView: "PERFORMANCE_VIEW",
  PerformanceGoalView: "PERFORMANCE_GOAL_VIEW",
  PerformanceGoalManage: "PERFORMANCE_GOAL_MANAGE",
  PerformanceResultView: "PERFORMANCE_RESULT_VIEW",
  PerformanceResultManage: "PERFORMANCE_RESULT_MANAGE",
  Performance360View: "PERFORMANCE_360_VIEW",
  Performance360Manage: "PERFORMANCE_360_MANAGE",

  TrainingView: "TRAINING_VIEW",
  TrainingCourseView: "TRAINING_COURSE_VIEW",
  TrainingEnrollmentView: "TRAINING_ENROLLMENT_VIEW",
  TrainingEnrollmentManage: "TRAINING_ENROLLMENT_MANAGE",
  TrainingResultView: "TRAINING_RESULT_VIEW",

  WorkflowView: "WORKFLOW_VIEW",
  WorkflowManage: "WORKFLOW_MANAGE",
  WorkflowInbox: "WORKFLOW_INBOX",

  RecruitmentInterviewView: "RECRUITMENT_INTERVIEW_VIEW",
  RecruitmentInterviewManage: "RECRUITMENT_INTERVIEW_MANAGE",

  LeaveApproveLegacy: "LEAVE_APPROVE",
} as const;

export type PermissionCode =
  (typeof PermissionCodes)[keyof typeof PermissionCodes];

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === "string" && !!x.trim())
    .map((x) => x.trim());
}
