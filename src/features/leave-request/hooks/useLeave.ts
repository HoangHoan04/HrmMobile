import { enumData } from "@/constants/enums/enumData";
import { getApiErrorMessage, parseInputDateToIso, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  CreateLeavePayload,
  DecideLeavePayload,
  LeaveSession,
  MobileLeaveBalanceDto,
  MobileLeaveConfigDto,
  PreviewLeaveDaysDto,
  RegisterDayOffDto,
} from "../types";

function mapConfig(c: any): MobileLeaveConfigDto {
  return {
    id: String(c?.id ?? ""),
    code: String(c?.code ?? ""),
    name: String(c?.name ?? ""),
    dayOffType: String(
      c?.dayOffType ?? enumData.DAY_OFF_TYPE.OTHER.code,
    ).toUpperCase(),
    defaultDaysPerYear: Number(c?.defaultDaysPerYear) || 0,
    isPaid: !!c?.isPaid,
    deductBalance: c?.deductBalance !== false,
    requireAttachment: !!c?.requireAttachment,
    maxDaysPerRequest:
      c?.maxDaysPerRequest == null || c?.maxDaysPerRequest === ""
        ? null
        : Number(c.maxDaysPerRequest),
    minNoticeDays: Number(c?.minNoticeDays) || 0,
  };
}

function normalizeSession(value?: string | number | null): LeaveSession {
  const raw = String(value ?? enumData.LEAVE_SESSION.FULL.value).toUpperCase();
  if (raw === enumData.LEAVE_SESSION.AM.value || raw === "2") {
    return enumData.LEAVE_SESSION.AM.value as LeaveSession;
  }
  if (raw === enumData.LEAVE_SESSION.PM.value || raw === "3") {
    return enumData.LEAVE_SESSION.PM.value as LeaveSession;
  }
  return enumData.LEAVE_SESSION.FULL.value as LeaveSession;
}

function mapLeaveDto(raw: any): RegisterDayOffDto {
  return {
    id: String(raw?.id ?? ""),
    employeeId: raw?.employeeId != null ? String(raw.employeeId) : undefined,
    employeeName: raw?.employeeName ?? null,
    employeeCode: raw?.employeeCode ?? null,
    companyId: raw?.companyId != null ? String(raw.companyId) : null,
    branchId: raw?.branchId != null ? String(raw.branchId) : null,
    branchName: raw?.branchName ?? null,
    dayOffConfigId:
      raw?.dayOffConfigId != null ? String(raw.dayOffConfigId) : null,
    dayOffConfigName: raw?.dayOffConfigName ?? null,
    dayOffType: String(raw?.dayOffType ?? "OTHER").toUpperCase(),
    fromDate: String(raw?.fromDate ?? ""),
    toDate: String(raw?.toDate ?? ""),
    session: normalizeSession(raw?.session),
    totalDays: Number(raw?.totalDays) || 0,
    reason: raw?.reason ?? null,
    attachmentUrl: raw?.attachmentUrl ?? null,
    status: String(
      raw?.status ?? enumData.DAY_OFF_STATUS.PENDING.code,
    ).toUpperCase(),
    requestedApproverId:
      raw?.requestedApproverId != null ? String(raw.requestedApproverId) : null,
    requestedApproverName: raw?.requestedApproverName ?? null,
    approverId: raw?.approverId != null ? String(raw.approverId) : null,
    approverName: raw?.approverName ?? null,
    approvedAt: raw?.approvedAt ?? null,
    approverNote: raw?.approverNote ?? null,
    cancelReason: raw?.cancelReason ?? null,
    createdAt: raw?.createdAt ?? undefined,
  };
}

export function useLeave() {
  const queryClient = useQueryClient();

  const {
    data: leaves = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchList,
  } = useQuery<RegisterDayOffDto[]>({
    queryKey: ["leaves", "list"],
    queryFn: async () => {
      const { data } = await rootApi.post(
        endpoints.leave.myList,
        { status: null, year: null },
        { skipErrorToast: true } as any,
      );
      return Array.isArray(data) ? data.map(mapLeaveDto) : [];
    },
  });

  const {
    data: pendingApprovals = [],
    isLoading: loadingPendingApprovals,
    refetch: refetchPendingApprovals,
  } = useQuery<RegisterDayOffDto[]>({
    queryKey: ["leaves", "pendingApprovals"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.leave.pendingApprovals,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data.map(mapLeaveDto) : [];
      } catch {
        //! User thường không phải quản lý → không chặn refresh toàn màn
        return [];
      }
    },
    retry: false,
  });

  const {
    data: balance,
    isLoading: loadingBalance,
    refetch: refetchBalance,
  } = useQuery<MobileLeaveBalanceDto>({
    queryKey: ["leaves", "balance"],
    queryFn: async () => {
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
          ? data.configs.map(mapConfig)
          : [],
      };
    },
  });

  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["leaves"] });
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: ["leaves", "list"],
        type: "all",
      }),
      queryClient.refetchQueries({
        queryKey: ["leaves", "balance"],
        type: "all",
      }),
    ]);
    void queryClient.refetchQueries({
      queryKey: ["leaves", "pendingApprovals"],
      type: "all",
    });
  }, [queryClient]);

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

      const session = normalizeSession(payload.session);
      if (
        (session === enumData.LEAVE_SESSION.AM.value ||
          session === enumData.LEAVE_SESSION.PM.value) &&
        fromDate !== toDate
      ) {
        throw new Error(t("leave.sessionSingleDay"));
      }

      if (!payload.dayOffConfigId) {
        throw new Error(t("leave.configRequired"));
      }

      const body: Record<string, unknown> = {
        fromDate,
        toDate,
        session,
        reason: payload.reason?.trim() || null,
        dayOffType: (payload.dayOffType || "ANNUAL").toUpperCase(),
        dayOffConfigId: payload.dayOffConfigId,
        attachmentUrl: payload.attachmentUrl?.trim() || null,
      };

      return rootApi.post(endpoints.leave.create, body, {
        skipErrorToast: true,
      } as any);
    },
    onSuccess: async () => {
      showToastSuccess(t("leave.createSuccess"));
      await refreshAll();
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
    onSuccess: async () => {
      showToastSuccess(t("leave.cancelSuccess"));
      await refreshAll();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "leave.cancelFailed"));
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (payload: DecideLeavePayload) => {
      return rootApi.post(
        endpoints.leave.approve,
        {
          id: payload.id,
          approverNote: payload.approverNote?.trim() || null,
        },
        { skipErrorToast: true } as any,
      );
    },
    onSuccess: async () => {
      showToastSuccess(t("leave.approveSuccess"));
      await refreshAll();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "leave.approveFailed"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: DecideLeavePayload) => {
      const note = payload.approverNote?.trim() || "";
      if (!note) {
        throw new Error(t("leave.rejectNoteRequired"));
      }
      return rootApi.post(
        endpoints.leave.reject,
        {
          id: payload.id,
          approverNote: note,
        },
        { skipErrorToast: true } as any,
      );
    },
    onSuccess: async () => {
      showToastSuccess(t("leave.rejectSuccess"));
      await refreshAll();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "leave.rejectFailed"));
    },
  });

  const previewDays = useCallback(
    async (
      fromDateInput: string,
      toDateInput: string,
      session: LeaveSession = enumData.LEAVE_SESSION.FULL.value as LeaveSession,
    ): Promise<PreviewLeaveDaysDto | null> => {
      const fromDate = parseInputDateToIso(fromDateInput);
      const toDate = parseInputDateToIso(toDateInput);
      if (!fromDate || !toDate || toDate < fromDate) {
        return null;
      }

      const normalized = normalizeSession(session);
      const effectiveTo =
        normalized === enumData.LEAVE_SESSION.AM.value ||
        normalized === enumData.LEAVE_SESSION.PM.value
          ? fromDate
          : toDate;

      try {
        const { data } = await rootApi.post(
          endpoints.leave.previewDays,
          {
            fromDate,
            toDate: effectiveTo,
            session: normalized,
          },
          { skipErrorToast: true } as any,
        );
        return {
          totalDays: Number(data?.totalDays) || 0,
          saturdayPolicy:
            data?.saturdayPolicy != null ? String(data.saturdayPolicy) : null,
          session: normalizeSession(data?.session),
          fromDate: data?.fromDate,
          toDate: data?.toDate,
        };
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "leave.previewDaysFailed"));
        return null;
      }
    },
    [],
  );

  return {
    leaves,
    pendingApprovals,
    balance,
    configs: balance?.configs ?? [],
    loading: loading || loadingBalance,
    loadingPendingApprovals,
    submitting:
      createMutation.isPending ||
      cancelMutation.isPending ||
      approveMutation.isPending ||
      rejectMutation.isPending,
    error: queryError
      ? getApiErrorMessage(queryError, "leave.genericError")
      : null,
    refreshAll,
    fetchMyList: refreshAll,
    fetchPendingApprovals: refetchPendingApprovals,
    refetchList,
    refetchBalance,
    previewDays,
    createLeave: createMutation.mutateAsync,
    cancelLeave: cancelMutation.mutateAsync,
    approveLeave: approveMutation.mutateAsync,
    rejectLeave: rejectMutation.mutateAsync,
  };
}
