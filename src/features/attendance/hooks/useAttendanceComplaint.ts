import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { getApiErrorMessage, t } from "@/features/common";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import {
  AttendanceComplaintDto,
  CreateAttendanceComplaintPayload,
} from "@/features/attendance/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAttendanceComplaint(enabledList = false) {
  const queryClient = useQueryClient();

  const myListQuery = useQuery<AttendanceComplaintDto[]>({
    queryKey: ["attendanceComplaint", "myList"],
    enabled: enabledList,
    queryFn: async () => {
      const res = await rootApi.post<AttendanceComplaintDto[]>(
        endpoints.attendanceComplaint.myList,
        {},
        { skipErrorToast: true } as any,
      );
      return res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateAttendanceComplaintPayload) => {
      const res = await rootApi.post<string>(
        endpoints.attendanceComplaint.create,
        payload,
        { skipErrorToast: true } as any,
      );
      return res.data;
    },
    onSuccess: () => {
      showToastSuccess(t("checkin.complaint.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["attendanceComplaint"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err) => {
      showToastError(getApiErrorMessage(err, "checkin.complaint.createFailed"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await rootApi.post<boolean>(
        endpoints.attendanceComplaint.cancel,
        { id },
        { skipErrorToast: true } as any,
      );
      return res.data;
    },
    onSuccess: () => {
      showToastSuccess(t("checkin.complaint.cancelSuccess"));
      queryClient.invalidateQueries({ queryKey: ["attendanceComplaint"] });
    },
    onError: (err) => {
      showToastError(getApiErrorMessage(err, "checkin.complaint.cancelFailed"));
    },
  });

  return {
    myList: myListQuery.data ?? [],
    loadingList: myListQuery.isLoading,
    refetchList: myListQuery.refetch,
    createComplaint: createMutation.mutateAsync,
    creating: createMutation.isPending,
    cancelComplaint: cancelMutation.mutateAsync,
    cancelling: cancelMutation.isPending,
  };
}
