import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface MobileTodayDto {
  workDate: string;
  status: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  lateMinutes?: number;
  earlyMinutes?: number;
  workedMinutes?: number;
  note?: string | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  onLeave: boolean;
  expectedStart?: string | null;
  expectedEnd?: string | null;
  branchName?: string | null;
  allowedRadiusMeters?: number;
}

export interface MobileMonthDayDto {
  workDate: string;
  status: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  workedMinutes?: number;
  workedHours?: number | null;
  lateMinutes?: number;
  earlyMinutes?: number;
  note?: string | null;
}

export interface MobileMonthDto {
  year: number;
  month: number;
  days: MobileMonthDayDto[];
  onTimeDays: number;
  lateDays: number;
  earlyDays: number;
  leaveDays: number;
  absentDays: number;
  incompleteDays: number;
  totalWorkedMinutes: number;
}

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
  const [today, setToday] = useState<MobileTodayDto | null>(null);
  const [month, setMonth] = useState<MobileMonthDto | null>(null);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoadingToday(true);
    setError(null);
    try {
      const { data } = await rootApi.post(endpoints.timekeeping.today, {}, {
        skipErrorToast: true,
      } as any);
      setToday(data);
      return data as MobileTodayDto;
    } catch (err: any) {
      const message = extractApiError(
        err,
        "Không tải được trạng thái chấm công",
      );
      setError(message);
      showToastError(message);
      throw err;
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchMonth = useCallback(async (year: number, monthNum: number) => {
    setLoadingMonth(true);
    setError(null);
    try {
      const { data } = await rootApi.post(
        endpoints.timekeeping.month,
        { year, month: monthNum },
        { skipErrorToast: true } as any,
      );
      setMonth(data);
      return data as MobileMonthDto;
    } catch (err: any) {
      const message = extractApiError(err, "Không tải được bảng công tháng");
      setError(message);
      showToastError(message);
      throw err;
    } finally {
      setLoadingMonth(false);
    }
  }, []);

  const punch = useCallback(async (action: "checkIn" | "checkOut") => {
    setPunching(true);
    setError(null);
    try {
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
      setToday(data);
      showToastSuccess(
        action === "checkIn" ? "Vào ca thành công" : "Ra ca thành công",
      );
      return data as MobileTodayDto;
    } catch (err: any) {
      const message = extractApiError(
        err,
        action === "checkIn" ? "Không thể vào ca" : "Không thể ra ca",
      );
      setError(message);
      Alert.alert("Chấm công thất bại", message);
      showToastError(message);
      throw err;
    } finally {
      setPunching(false);
    }
  }, []);

  const checkIn = useCallback(() => punch("checkIn"), [punch]);
  const checkOut = useCallback(() => punch("checkOut"), [punch]);

  return {
    today,
    month,
    loadingToday,
    loadingMonth,
    punching,
    error,
    fetchToday,
    fetchMonth,
    checkIn,
    checkOut,
  };
}
