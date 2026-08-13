import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useQuery } from "@tanstack/react-query";

export type TeamAttendanceMember = {
  employeeId?: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  onTimeDays?: number;
  lateDays?: number;
  earlyDays?: number;
  leaveDays?: number;
  absentDays?: number;
  totalWorkedMinutes?: number;
};

export type TeamMonthDto = {
  year?: number;
  month?: number;
  members?: TeamAttendanceMember[];
  items?: TeamAttendanceMember[];
};

export function useTeamAttendance(year: number, month: number, enabled = true) {
  return useQuery<TeamMonthDto>({
    queryKey: ["more", "team-attendance", year, month],
    enabled,
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.timekeeping.teamMonth,
          { year, month },
          { skipErrorToast: true } as any,
        );
        return (data || {}) as TeamMonthDto;
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}
