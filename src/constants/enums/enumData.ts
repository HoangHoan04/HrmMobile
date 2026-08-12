export const enumData = {
  ATTENDANCE_STATUS: {
    ON_TIME: {
      code: "ON_TIME",
      labelKey: "enums.attendance.onTime",
      color: "#10B981",
      bg: "#E6F4EA",
    },
    LATE: {
      code: "LATE",
      labelKey: "enums.attendance.late",
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    EARLY: {
      code: "EARLY",
      labelKey: "enums.attendance.early",
      color: "#8B5CF6",
      bg: "#F3E8FF",
    },
    LEAVE: {
      code: "LEAVE",
      labelKey: "enums.attendance.leave",
      color: "#9CA3AF",
      bg: "#F3F4F6",
    },
    ABSENT: {
      code: "ABSENT",
      labelKey: "enums.attendance.absent",
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    INCOMPLETE: {
      code: "INCOMPLETE",
      labelKey: "enums.attendance.incomplete",
      color: "#6B7280",
      bg: "#F3F4F6",
    },
  },
  DAY_OFF_TYPE: {
    ANNUAL: {
      code: "ANNUAL",
      labelKey: "enums.dayOffType.annual",
      icon: "calendar",
      color: "#10B981",
      isPaid: true,
    },
    SICK: {
      code: "SICK",
      labelKey: "enums.dayOffType.sick",
      icon: "medical",
      color: "#F59E0B",
      isPaid: true,
    },
    UNPAID: {
      code: "UNPAID",
      labelKey: "enums.dayOffType.unpaid",
      icon: "wallet-outline",
      color: "#EF4444",
      isPaid: false,
    },
    MATERNITY: {
      code: "MATERNITY",
      labelKey: "enums.dayOffType.maternity",
      icon: "heart",
      color: "#EC4899",
      isPaid: true,
    },
    PATERNITY: {
      code: "PATERNITY",
      labelKey: "enums.dayOffType.paternity",
      icon: "people",
      color: "#06B6D4",
      isPaid: true,
    },
    OTHER: {
      code: "OTHER",
      labelKey: "enums.dayOffType.other",
      icon: "briefcase",
      color: "#3B82F6",
      isPaid: true,
    },
  },
  DAY_OFF_STATUS: {
    PENDING: {
      code: "PENDING",
      labelKey: "enums.dayOffStatus.pending",
      action: "warning" as const,
    },
    APPROVED: {
      code: "APPROVED",
      labelKey: "enums.dayOffStatus.approved",
      action: "success" as const,
    },
    REJECTED: {
      code: "REJECTED",
      labelKey: "enums.dayOffStatus.rejected",
      action: "error" as const,
    },
    CANCELLED: {
      code: "CANCELLED",
      labelKey: "enums.dayOffStatus.cancelled",
      action: "muted" as const,
    },
  },
  DAY_OF_WEEK: {
    SUNDAY: {
      code: "SUNDAY",
      key: "CN",
      labelKey: "enums.daysOfWeek.sun",
      value: 0,
    },
    MONDAY: {
      code: "MONDAY",
      key: "T2",
      labelKey: "enums.daysOfWeek.mon",
      value: 1,
    },
    TUESDAY: {
      code: "TUESDAY",
      key: "T3",
      labelKey: "enums.daysOfWeek.tue",
      value: 2,
    },
    WEDNESDAY: {
      code: "WEDNESDAY",
      key: "T4",
      labelKey: "enums.daysOfWeek.wed",
      value: 3,
    },
    THURSDAY: {
      code: "THURSDAY",
      key: "T5",
      labelKey: "enums.daysOfWeek.thu",
      value: 4,
    },
    FRIDAY: {
      code: "FRIDAY",
      key: "T6",
      labelKey: "enums.daysOfWeek.fri",
      value: 5,
    },
    SATURDAY: {
      code: "SATURDAY",
      key: "T7",
      labelKey: "enums.daysOfWeek.sat",
      value: 6,
    },
  },
  ATTENDANCE_COMPLAINT_TYPE: {
    FORGOT_CHECK_IN: {
      code: "FORGOT_CHECK_IN",
      labelKey: "checkin.complaint.typeForgotCheckIn",
    },
    FORGOT_CHECK_OUT: {
      code: "FORGOT_CHECK_OUT",
      labelKey: "checkin.complaint.typeForgotCheckOut",
    },
    FORGOT_BOTH: {
      code: "FORGOT_BOTH",
      labelKey: "checkin.complaint.typeForgotBoth",
    },
    WRONG_TIME: {
      code: "WRONG_TIME",
      labelKey: "checkin.complaint.typeWrongTime",
    },
    OTHER: {
      code: "OTHER",
      labelKey: "checkin.complaint.typeOther",
    },
  },
};
