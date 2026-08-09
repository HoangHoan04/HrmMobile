export const enumData = {
  ATTENDANCE_STATUS: {
    ON_TIME: {
      code: "ON_TIME",
      label: "Đúng giờ",
      color: "#10B981",
      bg: "#E6F4EA",
    },
    LATE: { code: "LATE", label: "Đi muộn", color: "#F59E0B", bg: "#FEF3C7" },
    EARLY: { code: "EARLY", label: "Về sớm", color: "#8B5CF6", bg: "#F3E8FF" },
    LEAVE: {
      code: "LEAVE",
      label: "Nghỉ phép",
      color: "#9CA3AF",
      bg: "#F3F4F6",
    },
    ABSENT: {
      code: "ABSENT",
      label: "Vắng mặt",
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    INCOMPLETE: {
      code: "INCOMPLETE",
      label: "Chưa hoàn tất",
      color: "#6B7280",
      bg: "#F3F4F6",
    },
  },
  DAY_OFF_TYPE: {
    ANNUAL: {
      code: "ANNUAL",
      label: "Nghỉ phép năm",
      icon: "calendar",
      color: "#10B981",
    },
    SICK: {
      code: "SICK",
      label: "Nghỉ ốm",
      icon: "medical",
      color: "#F59E0B",
    },
    UNPAID: {
      code: "UNPAID",
      label: "Nghỉ không lương",
      icon: "wallet-outline",
      color: "#EF4444",
    },
    OTHER: {
      code: "OTHER",
      label: "Khác",
      icon: "briefcase",
      color: "#3B82F6",
    },
  },
  DAY_OFF_STATUS: {
    PENDING: {
      code: "PENDING",
      label: "Đang duyệt",
      action: "warning" as const,
    },
    APPROVED: {
      code: "APPROVED",
      label: "Đã duyệt",
      action: "success" as const,
    },
    REJECTED: {
      code: "REJECTED",
      label: "Từ chối",
      action: "error" as const,
    },
    CANCELLED: {
      code: "CANCELLED",
      label: "Đã hủy",
      action: "muted" as const,
    },
  },
};
