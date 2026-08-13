import { getApiErrorMessage, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type OtRequestDto = {
  id?: string;
  workDate?: string;
  date?: string;
  minutes?: number;
  overtimeMinutes?: number;
  reason?: string | null;
  status?: string | null;
  note?: string | null;
};

export type CreateOtPayload = {
  workDate: string;
  minutes: number;
  reason: string;
};

export function useMyOt() {
  const queryClient = useQueryClient();

  const listQuery = useQuery<OtRequestDto[]>({
    queryKey: ["more", "ot", "my"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.timekeeping.myOt,
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

  const createMutation = useMutation({
    mutationFn: async (payload: CreateOtPayload) => {
      const { data } = await rootApi.post(
        endpoints.timekeeping.createOt,
        payload,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onSuccess: () => {
      showToastSuccess(t("phaseM.ot.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["more", "ot"] });
    },
    onError: (err) => {
      showToastError(getApiErrorMessage(err, "phaseM.ot.createFailed"));
    },
  });

  return {
    items: listQuery.data ?? [],
    loading: listQuery.isLoading,
    refreshing: listQuery.isRefetching,
    error: listQuery.error,
    refetch: listQuery.refetch,
    createOt: createMutation.mutateAsync,
    creating: createMutation.isPending,
  };
}
