export enum AttendanceStatusType {
  NOT_CHECKED_IN = "NOT_CHECKED_IN",
  WORKING = "WORKING",
  COMPLETED = "COMPLETED",
  ON_LEAVE = "ON_LEAVE",
}

export interface AttendanceStatusDetails {
  key: string;
  color: string;
}

export const getAttendanceStatusKey = (
  isOnLeave: boolean,
  isCheckedIn: boolean,
  isCompleted: boolean,
): AttendanceStatusType => {
  if (isOnLeave) return AttendanceStatusType.ON_LEAVE;
  if (isCompleted) return AttendanceStatusType.COMPLETED;
  if (isCheckedIn) return AttendanceStatusType.WORKING;
  return AttendanceStatusType.NOT_CHECKED_IN;
};

export const getAttendanceStatusDetails = (
  status: AttendanceStatusType,
): AttendanceStatusDetails => {
  switch (status) {
    case AttendanceStatusType.ON_LEAVE:
      return { key: "onLeave", color: "#F59E0B" };
    case AttendanceStatusType.COMPLETED:
      return { key: "completed", color: "#10B981" };
    case AttendanceStatusType.WORKING:
      return { key: "working", color: "#3B82F6" };
    case AttendanceStatusType.NOT_CHECKED_IN:
    default:
      return { key: "notCheckedIn", color: "#9CA3AF" };
  }
};
