import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RegisterDayOffDto } from "../types";

function extractApiError(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim())
    return data.message;
  if (typeof error?.message === "string" && error.message.trim())
    return error.message;
  return fallback;
}

export function useLeave() {
  const queryClient = useQueryClient();

  const {
    data: leaves = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchMyList,
  } = useQuery<RegisterDayOffDto[]>({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.leave.myList,
          {
            status: null,
            year: null,
          },
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        const message = extractApiError(
          err,
          "Không tải được danh sách đơn nghỉ",
        );
        showToastError(message);
        throw err;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      dayOffType: string;
      fromDate: string;
      toDate: string;
      reason: string;
      dayOffConfigId?: string | null;
    }) => {
      return rootApi.post(
        endpoints.leave.create,
        {
          dayOffType: payload.dayOffType,
          fromDate: payload.fromDate,
          toDate: payload.toDate,
          reason: payload.reason,
          dayOffConfigId: payload.dayOffConfigId ?? null,
          employeeId: null,
        },
        { skipErrorToast: true } as any,
      );
    },
    onSuccess: () => {
      showToastSuccess("Đã gửi đơn nghỉ phép");
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (err: any) => {
      const message = extractApiError(err, "Không thể tạo đơn nghỉ phép");
      showToastError(message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return rootApi.post(endpoints.leave.cancel, { id }, {
        skipErrorToast: true,
      } as any);
    },
    onSuccess: () => {
      showToastSuccess("Đã hủy đơn nghỉ phép");
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (err: any) => {
      const message = extractApiError(err, "Không thể hủy đơn nghỉ phép");
      showToastError(message);
    },
  });

  return {
    leaves,
    loading,
    submitting: createMutation.isPending || cancelMutation.isPending,
    error: queryError ? extractApiError(queryError, "Có lỗi xảy ra") : null,
    fetchMyList,
    createLeave: createMutation.mutateAsync,
    cancelLeave: cancelMutation.mutateAsync,
  };
}
