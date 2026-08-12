import {
  Calendar,
  type CalendarDayMeta,
} from "@/components/ui/calendar";
import { DrawerMenuButton } from "@/components/layout/drawer";
import { Colors } from "@/constants/common/Colors";
import { enumData } from "@/constants/enums/enumData";
import {
  getAttendanceStatusBg,
  getAttendanceStatusColor,
  getAttendanceStatusLabelKey,
  resolveAttendanceStatus,
} from "@/constants/enums/attendanceStatus";
import { formatClock, parseWorkDate } from "@/features/common";
import { useAttendance } from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttendanceDay {
  date: Date;
  status: string;
  checkIn: string;
  checkOut: string;
  workedHours: number;
  note?: string;
}

export default function CheckInScreen() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();
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

  const calendarDayMeta = useMemo(() => {
    const meta: Record<number, CalendarDayMeta> = {};
    Object.values(attendanceData).forEach((day) => {
      const dayNum = day.date.getDate();
      const statusMeta = resolveAttendanceStatus(day.status);
      meta[dayNum] = {
        markerColor: statusMeta?.color || null,
        dimmed:
          selectedFilter !== "all" && day.status !== selectedFilter,
        disabled: !day.status || !statusMeta,
        data: day,
      };
    });
    return meta;
  }, [attendanceData, selectedFilter]);

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

  const handleDayPress = (day: Date, meta?: CalendarDayMeta) => {
    const dayData = (meta?.data as AttendanceDay | undefined) || null;
    if (!dayData?.status) return;
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

  const targetHours = useMemo(() => {
    if (month?.expectedWorkedMinutes != null && month.expectedWorkedMinutes > 0) {
      return Math.round((month.expectedWorkedMinutes / 60) * 10) / 10;
    }
    return 0;
  }, [month?.expectedWorkedMinutes]);

  const remainingHours = Math.max(0, targetHours - stats.workedHours);
  const progressPercent =
    targetHours > 0
      ? Math.min(100, (stats.workedHours / targetHours) * 100)
      : 0;

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
          <View style={{ width: 38 }} />
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: theme.textMain }]}>
              {t("checkin.title")}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              {t("checkin.subtitle")}
            </Text>
          </View>
          <DrawerMenuButton />
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
              {t("checkin.cumulativeHours")}
            </Text>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.overviewHours, { color: theme.primary }]}>
            {stats.workedHours.toFixed(1)}{" "}
            {targetHours > 0 && (
              <Text style={[styles.overviewMax, { color: theme.textSecondary }]}>
                {t("checkin.hoursOfTotal", { n: targetHours })}
              </Text>
            )}
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
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[styles.overviewHelpText, { color: theme.textSecondary }]}
          >
            {targetHours <= 0
              ? t("checkin.hoursNoTarget")
              : remainingHours > 0
                ? t("checkin.hoursRemaining", { n: remainingHours.toFixed(1) })
                : t("checkin.hoursComplete")}
          </Text>
        </View>

        <Calendar
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          dayMeta={calendarDayMeta}
          onDayPress={handleDayPress}
          formatMonthLabel={(m) =>
            t("checkin.monthLabel", {
              m: m.getMonth() + 1,
              y: m.getFullYear(),
            })
          }
          currentBadgeLabel={t("checkin.current")}
          loading={loadingMonth}
          loadingLabel={t("checkin.loading")}
          renderBelowHeader={
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === "all"
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
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
                  {t("common.all")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === enumData.ATTENDANCE_STATUS.LATE.code
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
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
                  {t("checkin.filterLate", { n: filterCounts.lates })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === enumData.ATTENDANCE_STATUS.EARLY.code
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
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
                  {t("checkin.filterEarly", { n: filterCounts.earlies })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === enumData.ATTENDANCE_STATUS.ABSENT.code
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
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
                  {t("checkin.filterAbsent", { n: filterCounts.absents })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === enumData.ATTENDANCE_STATUS.LEAVE.code
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
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
                  {t("checkin.filterLeave", { n: filterCounts.leaves })}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          }
        />

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
              {t("checkin.legendOnTime")}
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
              {t("checkin.legendLate")}
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
              {t("checkin.legendEarly")}
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
              {t("checkin.legendLeave")}
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
              {t("checkin.legendAbsent")}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t("checkin.statsTitle")}
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
                {t("checkin.statWorkDays")}
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
                {t("checkin.statOnTime")}
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
                {t("checkin.statLate")}
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
                {t("checkin.statEarly")}
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
              {selectedDay.date.toLocaleDateString(language === "en" ? "en-US" : "vi-VN", {
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
            {selectedDay.status && !!resolveAttendanceStatus(selectedDay.status) && (
              <View
                style={[
                  styles.sheetStatusBadge,
                  {
                    backgroundColor:
                      getAttendanceStatusBg(selectedDay.status) ?? undefined,
                  },
                ]}
              >
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        getAttendanceStatusColor(selectedDay.status) ??
                        undefined,
                      marginRight: 6,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.sheetStatusText,
                    {
                      color:
                        getAttendanceStatusColor(selectedDay.status) ??
                        undefined,
                    },
                  ]}
                >
                  {t(getAttendanceStatusLabelKey(selectedDay.status) ?? "")}
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
                    {t("checkin.checkInTime")}
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
                    {t("checkin.checkOutTime")}
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
                {t("checkin.dayWorkedHours")}
              </Text>
              <Text
                style={[styles.sheetDetailValue, { color: theme.textMain }]}
              >
                {t("checkin.hoursValue", { n: selectedDay.workedHours.toFixed(2) })}
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
              <Text style={styles.sheetActionText}>{t("common.close")}</Text>
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
