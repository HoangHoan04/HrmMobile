import { enumData } from "@/constants/enums/enumData";
import { PermissionCodes } from "@/constants/permissions";
import { useAuthStore } from "@/store/authStore";
import { useMemo } from "react";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const roles: string[] = useMemo(() => {
    const list = user?.roles;
    return Array.isArray(list)
      ? list.filter((x: unknown): x is string => typeof x === "string")
      : [];
  }, [user?.roles]);

  const permissions: string[] = useMemo(() => {
    const list = user?.permissions;
    return Array.isArray(list)
      ? list.filter((x: unknown): x is string => typeof x === "string")
      : [];
  }, [user?.permissions]);

  const userType = (user?.type || "").toString().toUpperCase();

  const isAdmin =
    userType === enumData.USER_TYPE.ADMIN.value ||
    roles.some(
      (r) => (r || "").toUpperCase() === enumData.USER_TYPE.ADMIN.value,
    );

  const has = (code: string): boolean => {
    if (!code) return true;
    if (isAdmin && permissions.length === 0) return true;
    return permissions.includes(code);
  };

  const hasAny = (...codes: string[]): boolean => {
    if (!codes.length) return true;
    if (isAdmin && permissions.length === 0) return true;
    return codes.some((c) => has(c));
  };

  return {
    roles,
    permissions,
    userType,
    isAdmin,
    has,
    hasAny,
    canApproveLeave:
      has(PermissionCodes.LeaveApprove) ||
      has(PermissionCodes.LeaveApproveLegacy) ||
      isAdmin,
    canCreateComplaint:
      has(PermissionCodes.AttendanceComplaintCreate) || isAdmin,
    canAccessMobile:
      has(PermissionCodes.MobileAccess) ||
      isAdmin ||
      permissions.length === 0,
    canViewTeamAttendance:
      has(PermissionCodes.LeaveApprove) ||
      has(PermissionCodes.LeaveApproveLegacy) ||
      has(PermissionCodes.TimekeepingView) ||
      isAdmin,
    canViewWorkflowInbox: has(PermissionCodes.WorkflowInbox) || isAdmin,
    canViewPerformance: has(PermissionCodes.PerformanceView) || isAdmin,
    canViewTraining: has(PermissionCodes.TrainingView) || isAdmin,
    canViewInterviews:
      has(PermissionCodes.RecruitmentInterviewView) || isAdmin,
  };
}
