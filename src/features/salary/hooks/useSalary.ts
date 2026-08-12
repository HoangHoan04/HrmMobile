import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useQuery } from "@tanstack/react-query";
import { mapSalaryDtoToPeriod, SalaryDto, SalaryPeriodView } from "../types";

export function useSalary() {
  const {
    data: periods = [],
    isLoading: loading,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery<SalaryPeriodView[]>({
    queryKey: ["salary", "my-list"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.salary.myList,
          { year: null, status: null },
          { skipErrorToast: true } as any,
        );
        const list = Array.isArray(data) ? (data as SalaryDto[]) : [];
        return list
          .map(mapSalaryDtoToPeriod)
          .sort((a, b) => b.year - a.year || b.month - a.month);
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "salary.loadFailed"));
        throw err;
      }
    },
  });

  return {
    periods,
    loading,
    refreshing: isRefetching,
    error: queryError,
    refetch,
  };
}
