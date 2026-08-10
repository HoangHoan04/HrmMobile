import {
  showToastError,
  showToastSuccess,
} from "@/helper/ToastEventEmitter";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import { MobileMonthDto, MobileTodayDto } from "@/features/attendance/types";
import * as Location from "expo-location";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

function extractApiError(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim())
    return data.message;
  if (typeof error?.message === "string" && error.message.trim())
    return error.message;
  return fallback;
}

async function getPunchCoordinates(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;

  if (status !== Location.PermissionStatus.GRANTED) {
    const requested = await Location.requestForegroundPermissionsAsync();
    status = requested.status;
  }

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error(
      "Cần quyền vị trí để chấm công. Vui lòng bật quyền vị trí trong Cài đặt.",
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function useAttendance() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

  const {
    data: today = null,
    isLoading: loadingToday,
    error: todayError,
    refetch: fetchToday,
  } = useQuery<MobileTodayDto | null>({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(endpoints.timekeeping.today, {}, {
          skipErrorToast: true,
        } as any);
        return data;
      } catch (err: any) {
        const message = extractApiError(err, "Không tải được trạng thái chấm công");
        showToastError(message);
        throw err;
      }
    },
  });

  const {
    data: month = null,
    isLoading: loadingMonth,
    error: monthError,
    refetch: refetchMonthQuery,
  } = useQuery<MobileMonthDto | null>({
    queryKey: ["attendance", "month", selectedYear, selectedMonth],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.timekeeping.month,
          { year: selectedYear, month: selectedMonth },
          { skipErrorToast: true } as any,
        );
        return data;
      } catch (err: any) {
        const message = extractApiError(err, "Không tải được bảng công tháng");
        showToastError(message);
        throw err;
      }
    },
  });

  const punchMutation = useMutation({
    mutationFn: async (action: "checkIn" | "checkOut") => {
      const coords = await getPunchCoordinates();
      const endpoint =
        action === "checkIn"
          ? endpoints.timekeeping.checkIn
          : endpoints.timekeeping.checkOut;
      const { data } = await rootApi.post(
        endpoint,
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        { skipErrorToast: true } as any,
      );
      return { data, action };
    },
    onSuccess: ({ data, action }) => {
      queryClient.setQueryData(["attendance", "today"], data);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      showToastSuccess(
        action === "checkIn" ? "Vào ca thành công" : "Ra ca thành công",
      );
    },
    onError: (err: any, action) => {
      const message = extractApiError(
        err,
        action === "checkIn" ? "Không thể vào ca" : "Không thể ra ca",
      );
      Alert.alert("Chấm công thất bại", message);
      showToastError(message);
    },
  });

  const fetchMonth = useCallback(async (year: number, monthNum: number) => {
    setSelectedYear(year);
    setSelectedMonth(monthNum);
    const result = await refetchMonthQuery();
    return result.data as MobileMonthDto;
  }, [refetchMonthQuery]);

  const checkIn = useCallback(() => punchMutation.mutateAsync("checkIn"), [punchMutation]);
  const checkOut = useCallback(() => punchMutation.mutateAsync("checkOut"), [punchMutation]);

  return {
    today,
    month,
    loadingToday,
    loadingMonth,
    punching: punchMutation.isPending,
    error: (todayError || monthError) ? extractApiError(todayError || monthError, "Có lỗi xảy ra") : null,
    fetchToday,
    fetchMonth,
    checkIn,
    checkOut,
  };
}
