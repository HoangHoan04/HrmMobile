import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useQuery } from "@tanstack/react-query";

export type TeamCalendarItem = {
  id?: string;
  employeeId?: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  fromDate?: string;
  toDate?: string;
  dayOffType?: string | null;
  dayOffConfigName?: string | null;
  totalDays?: number;
  status?: string | null;
};

export function useTeamCalendar(from: string, to: string, enabled = true) {
  return useQuery<TeamCalendarItem[]>({
    queryKey: ["more", "team-calendar", from, to],
    enabled: enabled && !!from && !!to,
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.leave.teamCalendar,
          { from, to },
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}
