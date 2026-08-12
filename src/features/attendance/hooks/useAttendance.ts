import { showAlert, showConfirm } from "@/components/ui/confirm";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { getApiErrorMessage, t } from "@/features/common";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import { MobileMonthDto, MobileTodayDto } from "@/features/attendance/types";
import * as Location from "expo-location";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";

export async function ensureLocationPermission(): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;

  if (status !== Location.PermissionStatus.GRANTED) {
    const requested = await Location.requestForegroundPermissionsAsync();
    status = requested.status;
  }

  return status === Location.PermissionStatus.GRANTED;
}

async function getPunchCoordinates(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const services = await Location.hasServicesEnabledAsync();
  if (!services) {
    throw new Error(t("attendance.gpsDisabled"));
  }

  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error(t("attendance.locationPermissionRequired"));
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

function isLocationSetupError(message: string): boolean {
  const gps = t("attendance.gpsDisabled");
  const permission = t("attendance.locationPermissionRequired");
  const lower = message.toLowerCase();
  return (
    message === gps ||
    message === permission ||
    lower.includes("gps") ||
    lower.includes("location") ||
    lower.includes("cài đặt") ||
    lower.includes("settings")
  );
}

export function useAttendance() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1,
  );

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
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "attendance.loadTodayFailed"));
        throw err;
      }
    },
  });

  const {
    data: month = null,
    isLoading: loadingMonth,
    error: monthError,
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
      } catch (err: unknown) {
        showToastError(getApiErrorMessage(err, "attendance.loadMonthFailed"));
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showToastSuccess(
        action === "checkIn"
          ? t("attendance.checkInSuccess")
          : t("attendance.checkOutSuccess"),
      );
    },
    onError: (err: unknown, action) => {
      const message = getApiErrorMessage(
        err,
        action === "checkIn"
          ? "attendance.checkInFailed"
          : "attendance.checkOutFailed",
      );
      if (isLocationSetupError(message)) {
        showConfirm({
          title: t("attendance.punchFailedTitle"),
          message,
          variant: "error",
          buttons: [
            { text: t("common.close"), style: "cancel" },
            {
              text: t("attendance.openSettings"),
              style: "default",
              onPress: () => {
                if (Platform.OS === "ios") Linking.openURL("app-settings:");
                else Linking.openSettings();
              },
            },
          ],
        });
      } else {
        showAlert(t("attendance.punchFailedTitle"), message, {
          variant: "error",
        });
      }
      showToastError(message);
    },
  });

  const fetchMonth = useCallback(
    async (year: number, monthNum: number) => {
      setSelectedYear(year);
      setSelectedMonth(monthNum);
      const result = await queryClient.fetchQuery({
        queryKey: ["attendance", "month", year, monthNum],
        queryFn: async () => {
          const { data } = await rootApi.post(
            endpoints.timekeeping.month,
            { year, month: monthNum },
            { skipErrorToast: true } as any,
          );
          return data as MobileMonthDto;
        },
      });
      return result;
    },
    [queryClient],
  );

  const checkIn = useCallback(
    () => punchMutation.mutateAsync("checkIn"),
    [punchMutation],
  );
  const checkOut = useCallback(
    () => punchMutation.mutateAsync("checkOut"),
    [punchMutation],
  );

  return {
    today,
    month,
    loadingToday,
    loadingMonth,
    punching: punchMutation.isPending,
    error:
      todayError || monthError
        ? getApiErrorMessage(
            todayError || monthError,
            "attendance.genericError",
          )
        : null,
    fetchToday,
    fetchMonth,
    checkIn,
    checkOut,
    ensureLocationPermission,
  };
}
