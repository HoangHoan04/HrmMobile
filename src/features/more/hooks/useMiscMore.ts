import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useQuery } from "@tanstack/react-query";

export type InterviewDto = {
  id?: string;
  candidateName?: string | null;
  jobTitle?: string | null;
  scheduledAt?: string | null;
  location?: string | null;
  status?: string | null;
  round?: string | number | null;
};

export type AnnouncementDto = {
  id?: string;
  title?: string | null;
  body?: string | null;
  publishedAt?: string | null;
  isActive?: boolean;
};

export type ManagerSummaryDto = {
  pendingLeaveApprovals?: number;
  teamLateThisMonth?: number;
  expiringContracts?: number;
  pendingWorkflow?: number;
  [key: string]: number | undefined;
};

export function useMyInterviews() {
  return useQuery<InterviewDto[]>({
    queryKey: ["more", "interviews"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.recruitment.myInterviews,
          {},
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

export function useAnnouncements() {
  return useQuery<AnnouncementDto[]>({
    queryKey: ["more", "announcements"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.announcements.myList,
          {},
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

export function useManagerDashboard() {
  return useQuery<ManagerSummaryDto>({
    queryKey: ["more", "manager-dashboard"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.dashboard.managerSummary,
          {},
          { skipErrorToast: true } as any,
        );
        return (data || {}) as ManagerSummaryDto;
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}
