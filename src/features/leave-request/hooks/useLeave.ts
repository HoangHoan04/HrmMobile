import { getApiErrorMessage, parseInputDateToIso, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateLeavePayload,
  MobileLeaveBalanceDto,
  RegisterDayOffDto,
} from "../types";

export function useLeave() {
  const queryClient = useQueryClient();

  const {
    data: leaves = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchMyList,
  } = useQuery<RegisterDayOffDto[]>({
    queryKey: ["leaves", "list"],
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
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "leave.loadFailed"));
        throw err;
      }
    },
  });

  const {
    data: balance,
    isLoading: loadingBalance,
    refetch: fetchBalance,
  } = useQuery<MobileLeaveBalanceDto>({
    queryKey: ["leaves", "balance"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.leave.balance,
          { year: null },
          { skipErrorToast: true } as any,
        );
        return {
          year: Number(data?.year) || new Date().getFullYear(),
          annualTotal: Number(data?.annualTotal) || 0,
          annualUsed: Number(data?.annualUsed) || 0,
          annualPending: Number(data?.annualPending) || 0,
          annualRemaining: Number(data?.annualRemaining) || 0,
          sickUsed: Number(data?.sickUsed) || 0,
          unpaidUsed: Number(data?.unpaidUsed) || 0,
          configs: Array.isArray(data?.configs)
            ? data.configs.map((c: any) => ({
                id: String(c.id ?? ""),
                code: String(c.code ?? ""),
                name: String(c.name ?? ""),
                dayOffType: String(c.dayOffType ?? "OTHER").toUpperCase(),
                defaultDaysPerYear: Number(c.defaultDaysPerYear) || 0,
                isPaid: !!c.isPaid,
              }))
            : [],
        };
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "leave.balanceFailed"));
        throw err;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateLeavePayload) => {
      const fromDate = parseInputDateToIso(payload.fromDate);
      const toDate = parseInputDateToIso(payload.toDate);
      if (!fromDate || !toDate) {
        throw new Error(t("leave.validationRequired"));
      }
      if (toDate < fromDate) {
        throw new Error(t("leave.validationDateOrder"));
      }

      const body: Record<string, unknown> = {
        fromDate,
        toDate,
        reason: payload.reason?.trim() || null,
        dayOffType: (payload.dayOffType || "ANNUAL").toUpperCase(),
      };

      if (payload.dayOffConfigId) {
        body.dayOffConfigId = payload.dayOffConfigId;
      }

      return rootApi.post(endpoints.leave.create, body, {
        skipErrorToast: true,
      } as any);
    },
    onSuccess: () => {
      showToastSuccess(t("leave.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "leave.createFailed"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return rootApi.post(endpoints.leave.cancel, { id }, {
        skipErrorToast: true,
      } as any);
    },
    onSuccess: () => {
      showToastSuccess(t("leave.cancelSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "leave.cancelFailed"));
    },
  });

  const refreshAll = async () => {
    await Promise.all([fetchMyList(), fetchBalance()]);
  };

  return {
    leaves,
    balance,
    configs: balance?.configs ?? [],
    loading: loading || loadingBalance,
    submitting: createMutation.isPending || cancelMutation.isPending,
    error: queryError
      ? getApiErrorMessage(queryError, "leave.genericError")
      : null,
    fetchMyList: refreshAll,
    createLeave: createMutation.mutateAsync,
    cancelLeave: cancelMutation.mutateAsync,
  };
}
