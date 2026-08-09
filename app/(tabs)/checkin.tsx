import { Colors } from "@/constants/common/Colors";
import { enumData } from "@/constants/enums/enumData";
import { useAttendance } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttendanceDay {
  date: Date;
  status: string;
  checkIn: string;
  checkOut: string;
  workedHours: number;
  note?: string;
}

function formatClock(value?: string | null): string {
  if (!value) return "--:--";
  if (/^\d{1,2}:\d{2}/.test(value) && !value.includes("T")) {
    const [h, m] = value.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function parseWorkDate(value: string): Date {
  const parts = value.split("-").map(Number);
  if (parts.length >= 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(value);
}

export default function CheckInScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { month, loadingMonth, fetchMonth } = useAttendance();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<AttendanceDay | null>(null);
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useFocusEffect(
    useCallback(() => {
      fetchMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1).catch(
        () => undefined,
      );
    }, [currentMonth, fetchMonth]),
  );

  const attendanceData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const monthIndex = currentMonth.getMonth();
    const data: { [key: string]: AttendanceDay } = {};

    const date = new Date(year, monthIndex, 1);
    while (date.getMonth() === monthIndex) {
      const dayStr = date.getDate().toString();
      data[dayStr] = {
        date: new Date(date),
        status: "",
        checkIn: "--:--",
        checkOut: "--:--",
        workedHours: 0,
      };
      date.setDate(date.getDate() + 1);
    }

    (month?.days || []).forEach((day) => {
      const workDate = parseWorkDate(day.workDate);
      if (
        workDate.getFullYear() !== year ||
        workDate.getMonth() !== monthIndex
      ) {
        return;
      }
      const dayStr = workDate.getDate().toString();
      const workedHours =
        day.workedHours ??
        (day.workedMinutes
          ? Math.round((day.workedMinutes / 60) * 100) / 100
          : 0);
      data[dayStr] = {
        date: workDate,
        status: day.status || "",
        checkIn: formatClock(day.checkInAt),
        checkOut: formatClock(day.checkOutAt),
        workedHours,
        note: day.note || undefined,
      };
    });

    return data;
  }, [currentMonth, month]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    const tempDate = new Date(year, month, 1);
    while (tempDate.getMonth() === month) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const stats = useMemo(() => {
    const ontime = month?.onTimeDays ?? 0;
    const late = month?.lateDays ?? 0;
    const early = month?.earlyDays ?? 0;
    const leave = month?.leaveDays ?? 0;
    const absent = month?.absentDays ?? 0;
    const workedHours = month?.totalWorkedMinutes
      ? Math.round((month.totalWorkedMinutes / 60) * 10) / 10
      : Object.values(attendanceData).reduce(
          (sum, d) => sum + d.workedHours,
          0,
        );

    const activeDays = ontime + late + early;
    return { activeDays, ontime, late, early, leave, absent, workedHours };
  }, [attendanceData, month]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const isCurrentMonthActive = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  }, [currentMonth]);

  const handleDaySelect = (dayData: AttendanceDay) => {
    if (!dayData.status) return;
    setSelectedDay(dayData);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedDay(null));
  };

  const filterCounts = useMemo(() => {
    if (month) {
      return {
        lates: month.lateDays,
        earlies: month.earlyDays,
        absents: month.absentDays,
        leaves: month.leaveDays,
      };
    }
    let lates = 0;
    let earlies = 0;
    let absents = 0;
    let leaves = 0;
    Object.values(attendanceData).forEach((d) => {
      if (d.status === enumData.ATTENDANCE_STATUS.LATE.code) lates++;
      else if (d.status === enumData.ATTENDANCE_STATUS.EARLY.code) earlies++;
      else if (d.status === enumData.ATTENDANCE_STATUS.ABSENT.code) absents++;
      else if (d.status === enumData.ATTENDANCE_STATUS.LEAVE.code) leaves++;
    });
    return { lates, earlies, absents, leaves };
  }, [attendanceData, month]);

  const targetHours = 88;
  const remainingHours = Math.max(0, targetHours - stats.workedHours);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={theme.textMain} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: theme.textMain }]}>
              Bảng công
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Chi tiết bảng công
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <View
          style={[
            styles.overviewCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <View style={styles.overviewHeader}>
            <Text
              style={[styles.overviewTitle, { color: theme.textSecondary }]}
            >
              GIỜ CÔNG LUỸ KẾ
            </Text>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.overviewHours, { color: theme.primary }]}>
            {stats.workedHours.toFixed(1)}{" "}
            <Text style={[styles.overviewMax, { color: theme.textSecondary }]}>
              / {targetHours} giờ
            </Text>
          </Text>

          <View
            style={[
              styles.progressBarBg,
              {
                backgroundColor: colorScheme === "dark" ? "#2B2E33" : "#E5E7EB",
              },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.min(100, (stats.workedHours / targetHours) * 100)}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[styles.overviewHelpText, { color: theme.textSecondary }]}
          >
            {remainingHours > 0
              ? `Còn ${remainingHours.toFixed(1)} giờ để đạt đủ công chuẩn.`
              : "Chúc mừng! Bạn đã hoàn thành chỉ tiêu giờ công tháng này."}
          </Text>
        </View>

        <View style={styles.monthSelectorRow}>
          <TouchableOpacity
            style={[
              styles.monthNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handlePrevMonth}
          >
            <Ionicons name="chevron-back" size={18} color={theme.primary} />
          </TouchableOpacity>

          <View style={[styles.monthPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.monthPillText}>
              Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
            </Text>
            {isCurrentMonthActive && (
              <View style={styles.currentMonthBadge}>
                <Text style={styles.currentMonthBadgeText}>Hiện tại</Text>
              </View>
            )}
            <Ionicons
              name="chevron-down-outline"
              size={14}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.monthNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handleNextMonth}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "all"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "all"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === enumData.ATTENDANCE_STATUS.LATE.code
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.LATE.code)
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === enumData.ATTENDANCE_STATUS.LATE.code
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Đi muộn ({filterCounts.lates})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === enumData.ATTENDANCE_STATUS.EARLY.code
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.EARLY.code)
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === enumData.ATTENDANCE_STATUS.EARLY.code
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Về sớm ({filterCounts.earlies})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === enumData.ATTENDANCE_STATUS.ABSENT.code
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.ABSENT.code)
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === enumData.ATTENDANCE_STATUS.ABSENT.code
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Vắng ({filterCounts.absents})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === enumData.ATTENDANCE_STATUS.LEAVE.code
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.LEAVE.code)
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === enumData.ATTENDANCE_STATUS.LEAVE.code
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Nghỉ phép ({filterCounts.leaves})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={[
            styles.calendarCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          {loadingMonth && (
            <View style={styles.calendarLoading}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text
                style={[
                  styles.calendarLoadingText,
                  { color: theme.textSecondary },
                ]}
              >
                Đang tải bảng công...
              </Text>
            </View>
          )}
          <View style={styles.calendarWeekdays}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, index) => (
              <Text
                key={d}
                style={[
                  styles.weekdayText,
                  index === 0 && { color: "#EF4444" },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <View key={`empty-${idx}`} style={styles.calendarDayCell} />
                );
              }

              const dayNumStr = day.getDate().toString();
              const dayData = attendanceData[dayNumStr] || {
                date: day,
                status: null,
              };
              const isToday = day.toDateString() === new Date().toDateString();
              const isDimmed =
                selectedFilter !== "all" && dayData.status !== selectedFilter;
              const statusColor = dayData.status
                ? enumData.ATTENDANCE_STATUS[
                    dayData.status as keyof typeof enumData.ATTENDANCE_STATUS
                  ]?.color
                : null;

              return (
                <TouchableOpacity
                  key={`day-${dayNumStr}`}
                  style={[
                    styles.calendarDayCell,
                    isToday && {
                      borderColor: theme.primary,
                      borderWidth: 1.5,
                      borderRadius: 10,
                    },
                    isDimmed && { opacity: 0.25 },
                  ]}
                  onPress={() => handleDaySelect(dayData)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayNumberText,
                      { color: theme.textMain },
                      day.getDay() === 0 && { color: "#EF4444" },
                      !dayData.status && { color: theme.textSecondary + "80" },
                    ]}
                  >
                    {dayNumStr}
                  </Text>

                  {statusColor ? (
                    <View
                      style={[styles.dayDot, { backgroundColor: statusColor }]}
                    />
                  ) : (
                    <View style={styles.dayDotPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: enumData.ATTENDANCE_STATUS.ON_TIME.color },
              ]}
            />
            <Text
              style={[styles.legendTextLabel, { color: theme.textSecondary }]}
            >
              Đúng giờ
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: enumData.ATTENDANCE_STATUS.LATE.color },
              ]}
            />
            <Text
              style={[styles.legendTextLabel, { color: theme.textSecondary }]}
            >
              Đi muộn
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: enumData.ATTENDANCE_STATUS.EARLY.color },
              ]}
            />
            <Text
              style={[styles.legendTextLabel, { color: theme.textSecondary }]}
            >
              Về sớm
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: enumData.ATTENDANCE_STATUS.LEAVE.color },
              ]}
            />
            <Text
              style={[styles.legendTextLabel, { color: theme.textSecondary }]}
            >
              Phép
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: enumData.ATTENDANCE_STATUS.ABSENT.color },
              ]}
            />
            <Text
              style={[styles.legendTextLabel, { color: theme.textSecondary }]}
            >
              Vắng
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          THỐNG KÊ CHI TIẾT
        </Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[
              styles.statGridCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <View
              style={[styles.statIconContainer, { backgroundColor: "#E1EEFB" }]}
            >
              <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.statCardValue, { color: theme.textMain }]}>
                {stats.activeDays}
              </Text>
              <Text
                style={[styles.statCardLabel, { color: theme.textSecondary }]}
              >
                Ngày làm việc
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statGridCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <View
              style={[styles.statIconContainer, { backgroundColor: "#E6F4EA" }]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#10B981"
              />
            </View>
            <View>
              <Text style={[styles.statCardValue, { color: theme.textMain }]}>
                {stats.ontime}
              </Text>
              <Text
                style={[styles.statCardLabel, { color: theme.textSecondary }]}
              >
                Đúng giờ
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statGridCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.LATE.code)
            }
          >
            <View
              style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}
            >
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.statCardValue, { color: theme.textMain }]}>
                {stats.late}
              </Text>
              <Text
                style={[styles.statCardLabel, { color: theme.textSecondary }]}
              >
                Lượt đi muộn
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statGridCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
              setSelectedFilter(enumData.ATTENDANCE_STATUS.EARLY.code)
            }
          >
            <View
              style={[styles.statIconContainer, { backgroundColor: "#F3E8FF" }]}
            >
              <Ionicons
                name="arrow-forward-outline"
                size={18}
                color="#8B5CF6"
              />
            </View>
            <View>
              <Text style={[styles.statCardValue, { color: theme.textMain }]}>
                {stats.early}
              </Text>
              <Text
                style={[styles.statCardLabel, { color: theme.textSecondary }]}
              >
                Lượt về sớm
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {selectedDay && (
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY: sheetAnim }],
              backgroundColor: theme.cardBg,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View style={styles.sheetGrabberContainer}>
            <View
              style={[styles.sheetGrabber, { backgroundColor: theme.border }]}
            />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.textMain }]}>
              {selectedDay.date.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={closeBottomSheet}
              style={styles.sheetCloseBtn}
            >
              <Ionicons name="close" size={22} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetBody}>
            {selectedDay.status && (
              <View
                style={[
                  styles.sheetStatusBadge,
                  {
                    backgroundColor:
                      enumData.ATTENDANCE_STATUS[
                        selectedDay.status as keyof typeof enumData.ATTENDANCE_STATUS
                      ]?.bg,
                  },
                ]}
              >
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        enumData.ATTENDANCE_STATUS[
                          selectedDay.status as keyof typeof enumData.ATTENDANCE_STATUS
                        ]?.color,
                      marginRight: 6,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.sheetStatusText,
                    {
                      color:
                        enumData.ATTENDANCE_STATUS[
                          selectedDay.status as keyof typeof enumData.ATTENDANCE_STATUS
                        ]?.color,
                    },
                  ]}
                >
                  {
                    enumData.ATTENDANCE_STATUS[
                      selectedDay.status as keyof typeof enumData.ATTENDANCE_STATUS
                    ]?.label
                  }
                </Text>
              </View>
            )}

            <View
              style={[
                styles.sheetTimeRow,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.sheetTimeBlock}>
                <Ionicons name="log-in-outline" size={18} color="#10B981" />
                <View style={{ marginLeft: 8 }}>
                  <Text
                    style={[
                      styles.sheetTimeLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Giờ vào ca
                  </Text>
                  <Text
                    style={[styles.sheetTimeValue, { color: theme.textMain }]}
                  >
                    {selectedDay.checkIn}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.sheetTimeDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <View style={styles.sheetTimeBlock}>
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <View style={{ marginLeft: 8 }}>
                  <Text
                    style={[
                      styles.sheetTimeLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Giờ ra ca
                  </Text>
                  <Text
                    style={[styles.sheetTimeValue, { color: theme.textMain }]}
                  >
                    {selectedDay.checkOut}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sheetDetailRow}>
              <Text
                style={[
                  styles.sheetDetailLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Số giờ công tính ngày
              </Text>
              <Text
                style={[styles.sheetDetailValue, { color: theme.textMain }]}
              >
                {selectedDay.workedHours.toFixed(2)} giờ
              </Text>
            </View>

            {selectedDay.note && (
              <View
                style={[
                  styles.sheetNoteBlock,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={theme.textSecondary}
                  style={{ marginTop: 2 }}
                />
                <Text style={[styles.sheetNoteText, { color: theme.textMain }]}>
                  {selectedDay.note}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.sheetActionButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={closeBottomSheet}
            >
              <Text style={styles.sheetActionText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitleWrap: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overviewCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  overviewTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  overviewHours: { fontSize: 32, fontWeight: "800" },
  overviewMax: { fontSize: 16, fontWeight: "500" },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginVertical: 14,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  overviewHelpText: { fontSize: 12, fontWeight: "500" },
  monthSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  monthPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  currentMonthBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  currentMonthBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  filterContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
  },

  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  calendarLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  calendarLoadingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.15)",
    paddingBottom: 10,
    marginBottom: 10,
  },
  weekdayText: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 10,
  },
  calendarDayCell: {
    width: SCREEN_WIDTH * 0.105,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  dayDotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 4,
  },

  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendTextLabel: {
    fontSize: 11,
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statGridCard: {
    width: "48.5%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },

  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 99,
  },
  sheetGrabberContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  sheetGrabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetBody: {
    gap: 14,
  },
  sheetStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sheetStatusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  sheetTimeRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sheetTimeBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTimeLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  sheetTimeValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  sheetTimeDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  sheetDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  sheetDetailLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  sheetDetailValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  sheetNoteBlock: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sheetNoteText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  sheetActionButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  sheetActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
