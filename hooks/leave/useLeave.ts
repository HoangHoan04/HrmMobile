import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import { useCallback, useState } from "react";

export interface RegisterDayOffDto {
  id: string;
  employeeId?: string;
  employeeName?: string | null;
  employeeCode?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  dayOffConfigId?: string | null;
  dayOffConfigName?: string | null;
  dayOffType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason?: string | null;
  status: string;
  approverId?: string | null;
  approverName?: string | null;
  approvedAt?: string | null;
  approverNote?: string | null;
  createdAt?: string;
}

export interface CreateLeavePayload {
  dayOffType: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  dayOffConfigId?: string | null;
}

function extractApiError(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return fallback;
}

export function useLeave() {
  const [leaves, setLeaves] = useState<RegisterDayOffDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyList = useCallback(async (params?: { status?: string; year?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await rootApi.post(
        endpoints.leave.myList,
        {
          status: params?.status ?? null,
          year: params?.year ?? null,
        },
        { skipErrorToast: true } as any,
      );
      const list = Array.isArray(data) ? data : [];
      setLeaves(list);
      return list as RegisterDayOffDto[];
    } catch (err: any) {
      const message = extractApiError(err, "Không tải được danh sách đơn nghỉ");
      setError(message);
      showToastError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLeave = useCallback(async (payload: CreateLeavePayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await rootApi.post(
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
      showToastSuccess("Đã gửi đơn nghỉ phép");
      await fetchMyList();
    } catch (err: any) {
      const message = extractApiError(err, "Không thể tạo đơn nghỉ phép");
      setError(message);
      showToastError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchMyList]);

  const cancelLeave = useCallback(async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await rootApi.post(
        endpoints.leave.cancel,
        { id },
        { skipErrorToast: true } as any,
      );
      showToastSuccess("Đã hủy đơn nghỉ phép");
      setLeaves((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "CANCELLED" } : item,
        ),
      );
    } catch (err: any) {
      const message = extractApiError(err, "Không thể hủy đơn nghỉ phép");
      setError(message);
      showToastError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    leaves,
    loading,
    submitting,
    error,
    fetchMyList,
    createLeave,
    cancelLeave,
  };
}
