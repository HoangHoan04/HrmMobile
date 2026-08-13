import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import {
  mapSalaryDtoToPeriod,
  SalaryDto,
  SalaryPeriodView,
} from "@/features/salary/types";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useCallback, useState } from "react";

export function useSalaryDetail() {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<SalaryPeriodView | null>(null);

  const fetchDetail = useCallback(async (id: string) => {
    if (!id) return null;
    setLoading(true);
    try {
      const { data } = await rootApi.post<SalaryDto>(
        endpoints.salary.detail,
        { id },
        { skipErrorToast: true } as any,
      );
      const mapped = data ? mapSalaryDtoToPeriod(data) : null;
      setDetail(mapped);
      return mapped;
    } catch (err) {
      showToastError(getApiErrorMessage(err, "salary.loadFailed"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayslipHtml = useCallback(async (id: string) => {
    const { data } = await rootApi.post(
      endpoints.salary.payslipHtml,
      { id },
      { skipErrorToast: true } as any,
    );
    if (typeof data === "string") return { html: data, url: null as string | null };
    if (data?.url) return { html: null as string | null, url: String(data.url) };
    if (data?.html) return { html: String(data.html), url: null as string | null };
    if (data?.payslipHtml)
      return { html: String(data.payslipHtml), url: null as string | null };
    return { html: null as string | null, url: null as string | null };
  }, []);

  return { detail, loading, fetchDetail, fetchPayslipHtml };
}
