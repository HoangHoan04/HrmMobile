import { getApiErrorMessage, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GoalDto = {
  id?: string;
  title?: string | null;
  name?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  progressPercent?: number | null;
  status?: string | null;
  cycleName?: string | null;
};

export type ResultDto = {
  id?: string;
  title?: string | null;
  score?: number | null;
  rating?: string | null;
  cycleName?: string | null;
  note?: string | null;
};

export type Review360Dto = {
  id?: string;
  subjectName?: string | null;
  reviewerName?: string | null;
  score?: number | null;
  comment?: string | null;
  status?: string | null;
};

export function usePerformance(cycleId?: string | null) {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery<GoalDto[]>({
    queryKey: ["more", "performance", "goals", cycleId || "all"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.performance.myGoals,
          { cycleId: cycleId || null },
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const resultsQuery = useQuery<ResultDto[]>({
    queryKey: ["more", "performance", "results"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.performance.myResults,
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

  const reviewsQuery = useQuery<Review360Dto[]>({
    queryKey: ["more", "performance", "360"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.performance.my360,
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

  const upsertMutation = useMutation({
    mutationFn: async (payload: {
      id?: string | null;
      subjectEmployeeId?: string | null;
      score: number;
      comment: string;
    }) => {
      const { data } = await rootApi.post(
        endpoints.performance.upsert360,
        payload,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onSuccess: () => {
      showToastSuccess(t("phaseM.performance.save360Success"));
      queryClient.invalidateQueries({ queryKey: ["more", "performance"] });
    },
    onError: (err) => {
      showToastError(
        getApiErrorMessage(err, "phaseM.performance.save360Failed"),
      );
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    results: resultsQuery.data ?? [],
    reviews: reviewsQuery.data ?? [],
    loading:
      goalsQuery.isLoading || resultsQuery.isLoading || reviewsQuery.isLoading,
    refreshing:
      goalsQuery.isRefetching ||
      resultsQuery.isRefetching ||
      reviewsQuery.isRefetching,
    refetch: async () => {
      await Promise.all([
        goalsQuery.refetch(),
        resultsQuery.refetch(),
        reviewsQuery.refetch(),
      ]);
    },
    upsert360: upsertMutation.mutateAsync,
    saving360: upsertMutation.isPending,
  };
}
