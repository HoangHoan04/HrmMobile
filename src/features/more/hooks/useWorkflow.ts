import { getApiErrorMessage, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type WorkflowInboxItem = {
  id?: string;
  requestId?: string;
  title?: string | null;
  requestType?: string | null;
  requesterName?: string | null;
  status?: string | null;
  createdAt?: string | null;
  note?: string | null;
};

export function useWorkflowInbox() {
  const queryClient = useQueryClient();

  const listQuery = useQuery<WorkflowInboxItem[]>({
    queryKey: ["more", "workflow", "inbox"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.workflow.inbox,
          {},
          { skipErrorToast: true } as any,
        );
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const advanceMutation = useMutation({
    mutationFn: async (payload: { id: string; note?: string | null }) => {
      const { data } = await rootApi.post(
        endpoints.workflow.advance,
        payload,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onSuccess: () => {
      showToastSuccess(t("phaseM.workflow.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["more", "workflow"] });
    },
    onError: (err) => {
      showToastError(getApiErrorMessage(err, "phaseM.workflow.actionFailed"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: { id: string; note?: string | null }) => {
      const { data } = await rootApi.post(
        endpoints.workflow.reject,
        payload,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onSuccess: () => {
      showToastSuccess(t("phaseM.workflow.rejectSuccess"));
      queryClient.invalidateQueries({ queryKey: ["more", "workflow"] });
    },
    onError: (err) => {
      showToastError(getApiErrorMessage(err, "phaseM.workflow.actionFailed"));
    },
  });

  return {
    items: listQuery.data ?? [],
    loading: listQuery.isLoading,
    refreshing: listQuery.isRefetching,
    refetch: listQuery.refetch,
    advance: advanceMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    acting: advanceMutation.isPending || rejectMutation.isPending,
  };
}
