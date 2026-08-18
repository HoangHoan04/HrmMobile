import { DrawerMenuButton } from "@/components/layout/drawer";
import { showAlert } from "@/components/ui/confirm";
import { Colors } from "@/constants/common/Colors";
import { formatClock, getLocalizedDate } from "@/features/common";
import { getQuickAccessItems } from "@/features/home/quickAccess";
import { useAttendance, useProfile } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import {
  getAttendanceStatusDetails,
  getAttendanceStatusKey,
} from "@/utils/coreHelper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const activeColorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[activeColorScheme];
  const { profile, loading } = useProfile();
  const {
    today,
    month,
    loadingToday,
    punching,
    error: attendanceError,
    fetchToday,
    fetchMonth,
    checkIn,
    checkOut,
    ensureLocationPermission,
  } = useAttendance();

  const checkInTime = formatClock(today?.checkInAt);
  const checkOutTime = formatClock(today?.checkOutAt);

  const shiftLabel = useMemo(() => {
    const start = formatClock(today?.expectedStart);
    const end = formatClock(today?.expectedEnd);
    if (start === "--:--" && end === "--:--") return "--:-- – --:--";
    return `${start} – ${end}`;
  }, [today?.expectedStart, today?.expectedEnd]);

  const breakLabel = useMemo(() => {
    const start = formatClock(today?.expectedBreakStart);
    const end = formatClock(today?.expectedBreakEnd);
    if (start === "--:--" && end === "--:--") return null;
    return `${start} – ${end}`;
  }, [today?.expectedBreakStart, today?.expectedBreakEnd]);

  const canCheckIn = !!today?.canCheckIn;
  const canCheckOut = !!today?.canCheckOut;
  const showCheckOutAction =
    canCheckOut || (!canCheckIn && !!today?.checkInAt && !today?.checkOutAt);
  const canPunch =
    (canCheckIn || canCheckOut || showCheckOutAction) && !punching;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      fetchToday()
        .catch(() => undefined)
        .finally(() => {
          const now = new Date();
          fetchMonth(now.getFullYear(), now.getMonth() + 1).catch(
            () => undefined,
          );
        });
      ensureLocationPermission().catch(() => undefined);

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }, [fetchToday, fetchMonth, ensureLocationPermission, pulseAnim]),
  );

  const handleAttendancePress = async () => {
    if (punching || loadingToday) return;
    if (today?.onLeave) {
      showAlert(t("home.onLeaveBlockedTitle"), t("home.onLeaveBlockedBody"), {
        variant: "warning",
      });
      return;
    }
    try {
      if (canCheckOut || showCheckOutAction) {
        await checkOut();
      } else if (canCheckIn) {
        await checkIn();
      } else {
        showAlert(t("home.attendanceDoneTitle"), t("home.attendanceDoneBody"), {
          variant: "info",
        });
      }
    } catch {}
  };

  const quickAccessItems = useMemo(() => getQuickAccessItems(t), [t]);

  const renderIcon = (
    item: (typeof quickAccessItems)[0],
    size = 22,
    color?: string,
  ) => {
    const iconColor = color || item.color;
    if (item.iconType === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={item.icon as any}
          size={size}
          color={iconColor}
        />
      );
    }
    return <Ionicons name={item.icon as any} size={size} color={iconColor} />;
  };

  const displayName =
    profile?.fullName ||
    user?.fullName ||
    (profile?.username
      ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
      : user?.username || t("common.employee"));

  const branchLabel =
    today?.branchName || profile?.branchName || profile?.branch || "—";

  const avatarUrl = profile?.avatarUrl || user?.avatarUrl;

  const monthStats = useMemo(() => {
    if (month) {
      return {
        workDays: month.onTimeDays + month.lateDays + month.earlyDays,
        onTimeDays: month.onTimeDays,
        leaveDays: month.leaveDays,
      };
    }
    return {
      workDays: profile?.stats?.workDaysThisMonth ?? null,
      onTimeDays: profile?.stats?.onTimeDays ?? null,
      leaveDays:
        profile?.stats?.leaveDaysThisMonth ??
        profile?.stats?.leaveDaysRemaining ??
        null,
    };
  }, [month, profile?.stats]);

  const formatStat = (value: number | null | undefined) =>
    value == null ? "--" : String(value);

  const isCompleted = !!today?.checkOutAt;
  const isCheckedIn = !!today?.checkInAt && !today?.checkOutAt;
  const isOnLeave = !!today?.onLeave;

  const statusKey = getAttendanceStatusKey(isOnLeave, isCheckedIn, isCompleted);
  const statusDetails = getAttendanceStatusDetails(statusKey);
  const statusLabel = t(`home.${statusDetails.key}`);
  const statusColor = statusDetails.color;

  const punchColor = showCheckOutAction ? theme.danger : theme.primary;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              backgroundColor: theme.primary,
            },
          ]}
        >
          <View style={styles.headerBlobA} />
          <View style={styles.headerBlobB} />

          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.avatarWrap}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <View style={styles.avatarRing}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons name="person" size={22} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.onlineDot,
                  {
                    borderColor: theme.primary,
                    backgroundColor: theme.success,
                  },
                ]}
              />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.greet}>{t("home.hello")} 👋</Text>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.dateText}>{getLocalizedDate(language)}</Text>
            </View>

            <DrawerMenuButton variant="onPrimary" />
          </View>

          <View style={styles.statusChip}>
            <View
              style={[styles.statusChipDot, { backgroundColor: statusColor }]}
            />
            <Text style={styles.statusChipText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.cardEyebrow, { color: theme.textSecondary }]}
                >
                  {t("home.attendanceStatus")}
                </Text>
                <Text style={[styles.cardTitle, { color: theme.textMain }]}>
                  {shiftLabel}
                </Text>
                {breakLabel ? (
                  <Text
                    style={[
                      styles.cardEyebrow,
                      { color: theme.textSecondary, marginTop: 4 },
                    ]}
                  >
                    {t("home.lunchBreak")}: {breakLabel}
                  </Text>
                ) : null}
                {today && today.isScheduledWorkDay === false ? (
                  <Text
                    style={[
                      styles.cardEyebrow,
                      { color: theme.warning, marginTop: 4 },
                    ]}
                  >
                    {t("home.notWorkDay")}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.shiftPill,
                  { backgroundColor: theme.primary + "14" },
                ]}
              >
                <Ionicons name="time-outline" size={13} color={theme.primary} />
                <Text style={[styles.shiftPillText, { color: theme.primary }]}>
                  {t("home.expectedShift")}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <View
                  style={[
                    styles.timeIcon,
                    { backgroundColor: theme.success + "18" },
                  ]}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={18}
                    color={theme.success}
                  />
                </View>
                <Text
                  style={[styles.timeLabel, { color: theme.textSecondary }]}
                >
                  {t("home.checkIn")}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    {
                      color:
                        checkInTime === "--:--"
                          ? theme.textSecondary
                          : theme.success,
                    },
                  ]}
                >
                  {checkInTime}
                </Text>
              </View>

              <View style={styles.timeMid}>
                <View
                  style={[styles.timeLine, { backgroundColor: theme.border }]}
                />
                <View
                  style={[
                    styles.timeArrow,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={theme.textSecondary}
                  />
                </View>
                <View
                  style={[styles.timeLine, { backgroundColor: theme.border }]}
                />
              </View>

              <View style={styles.timeCol}>
                <View
                  style={[
                    styles.timeIcon,
                    { backgroundColor: theme.danger + "18" },
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={theme.danger}
                  />
                </View>
                <Text
                  style={[styles.timeLabel, { color: theme.textSecondary }]}
                >
                  {t("home.checkOut")}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    {
                      color:
                        checkOutTime === "--:--"
                          ? theme.textSecondary
                          : theme.danger,
                    },
                  ]}
                >
                  {checkOutTime}
                </Text>
              </View>
            </View>

            {(today?.status || today?.onLeave || today?.branchName) && (
              <View
                style={[
                  styles.infoBar,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={statusColor}
                />
                <Text
                  style={[styles.infoBarText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {today?.onLeave
                    ? t("home.onLeave")
                    : today?.status || branchLabel}
                </Text>
              </View>
            )}

            {attendanceError && !loadingToday ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {attendanceError}
              </Text>
            ) : null}

            <View style={styles.punchWrap}>
              {loadingToday && !today ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <Animated.View
                  style={{
                    transform: [{ scale: canPunch ? pulseAnim : 1 }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.punchBtn,
                      {
                        backgroundColor: punchColor,
                        shadowColor: punchColor,
                        opacity: canPunch || punching ? 1 : 0.45,
                      },
                    ]}
                    onPress={handleAttendancePress}
                    activeOpacity={0.85}
                    disabled={
                      punching ||
                      loadingToday ||
                      (!canCheckIn && !canCheckOut && !showCheckOutAction)
                    }
                  >
                    <View style={styles.punchInner}>
                      {punching ? (
                        <ActivityIndicator size="large" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={
                              showCheckOutAction
                                ? "finger-print-outline"
                                : "finger-print"
                            }
                            size={36}
                            color="#FFFFFF"
                          />
                          <Text style={styles.punchLabel}>
                            {showCheckOutAction
                              ? t("home.punchOut")
                              : canCheckIn
                                ? t("home.punchIn")
                                : t("home.punchDone")}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              {
                label: t("home.statsWorkDays"),
                value: formatStat(monthStats.workDays),
                icon: "checkmark-circle" as const,
                color: theme.success,
              },
              {
                label: t("home.statsOnTime"),
                value: formatStat(monthStats.onTimeDays),
                icon: "timer-outline" as const,
                color: theme.primary,
              },
              {
                label: t("home.statsLeaveDays"),
                value: formatStat(monthStats.leaveDays),
                icon: "calendar-outline" as const,
                color: theme.warning,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: stat.color + "18" },
                  ]}
                >
                  <Ionicons name={stat.icon} size={15} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: theme.textMain }]}>
                  {stat.value}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.sectionHead}>
              <View
                style={[styles.sectionBar, { backgroundColor: theme.primary }]}
              />
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                {t("home.quickAccess")}
              </Text>
            </View>
            <View style={styles.quickGrid}>
              {quickAccessItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.quickItem}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (item.route) router.push(item.route);
                  }}
                >
                  <View
                    style={[styles.quickIcon, { backgroundColor: item.bg }]}
                  >
                    {renderIcon(item)}
                  </View>
                  <Text
                    style={[styles.quickLabel, { color: theme.textMain }]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.sectionHead}>
              <View
                style={[styles.sectionBar, { backgroundColor: theme.success }]}
              />
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                {t("home.today")}
              </Text>
            </View>

            {[
              {
                icon: "sunny-outline" as const,
                label: t("home.morning"),
                value:
                  checkInTime !== "--:--"
                    ? `${t("home.checkedInAt")} ${checkInTime}`
                    : t("home.notCheckedInYet"),
                color:
                  checkInTime !== "--:--" ? theme.success : theme.textSecondary,
                iconColor: theme.warning,
              },
              {
                icon: "moon-outline" as const,
                label: t("home.afternoon"),
                value:
                  checkOutTime !== "--:--"
                    ? `${t("home.checkedOutAt")} ${checkOutTime}`
                    : t("home.notCheckedInYet"),
                color:
                  checkOutTime !== "--:--" ? theme.danger : theme.textSecondary,
                iconColor: theme.primary,
              },
              {
                icon: "business-outline" as const,
                label: t("home.branch"),
                value: branchLabel,
                color: theme.textMain,
                iconColor: "#06B6D4",
              },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  styles.summaryRow,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: row.iconColor + "18" },
                  ]}
                >
                  <Ionicons name={row.icon} size={16} color={row.iconColor} />
                </View>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[styles.summaryValue, { color: row.color }]}
                  numberOfLines={1}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  headerBlobA: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -50,
    right: -40,
  },
  headerBlobB: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: 10,
    left: -30,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerText: { flex: 1 },
  greet: {
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "500",
  },
  name: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "800",
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
    fontWeight: "500",
  },
  statusChip: {
    alignSelf: "flex-start",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  statusChipDot: { width: 7, height: 7, borderRadius: 4 },
  statusChipText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },

  body: {
    paddingHorizontal: 16,
    marginTop: -14,
  },

  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 14,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  shiftPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  shiftPillText: { fontSize: 11, fontWeight: "600" },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  timeCol: { flex: 1, alignItems: "center", gap: 5 },
  timeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timeLabel: { fontSize: 11, fontWeight: "600" },
  timeValue: { fontSize: 24, fontWeight: "800", letterSpacing: 0.3 },
  timeMid: {
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  timeLine: { flex: 1, height: StyleSheet.hairlineWidth },
  timeArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  infoBarText: { flex: 1, fontSize: 12, fontWeight: "500" },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },

  punchWrap: { alignItems: "center", paddingTop: 4, paddingBottom: 2 },
  punchBtn: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  punchInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  punchLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 13,
  },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionBar: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  quickItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { flex: 1, fontSize: 13, fontWeight: "500" },
  summaryValue: { fontSize: 13, fontWeight: "600", maxWidth: "48%" },
});
