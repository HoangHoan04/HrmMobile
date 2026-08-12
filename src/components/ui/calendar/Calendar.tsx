import { Colors } from "@/constants/common/Colors";
import { getCalendarWeekdayLabels } from "@/constants/enums/dayOfWeek";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type CalendarDayMeta = {
  markerColor?: string | null;
  dimmed?: boolean;
  disabled?: boolean;
  data?: unknown;
};

export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

export type CalendarProps = {
  month: Date;
  onMonthChange?: (month: Date) => void;
  dayMeta?: Record<number, CalendarDayMeta>;
  onDayPress?: (day: Date, meta?: CalendarDayMeta) => void;
  selectedDate?: Date | string | null;
  weekdays?: string[];
  formatMonthLabel?: (month: Date) => string;
  currentBadgeLabel?: string;
  showHeader?: boolean;
  showCurrentBadge?: boolean;
  renderBelowHeader?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  sundayHighlightColor?: string;
  todayAccentColor?: string;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  gridStyle?: StyleProp<ViewStyle>;
  dayTextStyle?: StyleProp<TextStyle>;
};
export function toMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildCalendarDays(month: Date): CalendarCell[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const startOffset = firstOfMonth.getDay();
  const endOffset = 6 - lastOfMonth.getDay();

  const totalCells = startOffset + lastOfMonth.getDate() + endOffset;
  const gridStart = new Date(year, monthIndex, 1 - startOffset);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    );
    cells.push({
      date,
      inCurrentMonth: date.getMonth() === monthIndex,
    });
  }
  return cells;
}

export function Calendar({
  month,
  onMonthChange,
  dayMeta,
  onDayPress,
  selectedDate,
  weekdays,
  formatMonthLabel,
  currentBadgeLabel,
  showHeader = true,
  showCurrentBadge = true,
  renderBelowHeader,
  loading = false,
  loadingLabel,
  sundayHighlightColor = "#EF4444",
  todayAccentColor,
  style,
  headerStyle,
  gridStyle,
  dayTextStyle,
}: CalendarProps) {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();
  const todayAccent = todayAccentColor ?? theme.primary;

  const weekdayLabels = useMemo(
    () =>
      (weekdays?.length ? weekdays : getCalendarWeekdayLabels(t)).slice(0, 7),
    [weekdays, t, language],
  );

  const monthStart = useMemo(() => toMonthStart(month), [month]);
  const calendarDays = useMemo(
    () => buildCalendarDays(monthStart),
    [monthStart],
  );

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return isSameMonth(monthStart, now);
  }, [monthStart]);

  const selectedKey = useMemo(() => {
    if (!selectedDate) return null;
    if (typeof selectedDate === "string") {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(selectedDate.trim());
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const d = new Date(selectedDate);
      return Number.isNaN(d.getTime()) ? null : toLocalDateKey(d);
    }
    return toLocalDateKey(selectedDate);
  }, [selectedDate]);

  const monthLabel = formatMonthLabel
    ? formatMonthLabel(monthStart)
    : `${monthStart.getMonth() + 1}/${monthStart.getFullYear()}`;

  const handlePrevMonth = () => {
    if (!onMonthChange) return;
    onMonthChange(
      new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    if (!onMonthChange) return;
    onMonthChange(
      new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
    );
  };

  const todayKey = useMemo(() => toLocalDateKey(new Date()), []);

  return (
    <View style={styles.root}>
      {showHeader && (
        <View style={[styles.monthSelectorRow, headerStyle]}>
          <TouchableOpacity
            style={[
              styles.monthNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handlePrevMonth}
            disabled={!onMonthChange}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={theme.primary} />
          </TouchableOpacity>

          <View style={[styles.monthPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.monthPillText}>{monthLabel}</Text>
            {showCurrentBadge && isCurrentMonth && !!currentBadgeLabel && (
              <View style={styles.currentMonthBadge}>
                <Text style={styles.currentMonthBadgeText}>
                  {currentBadgeLabel}
                </Text>
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
            disabled={!onMonthChange}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {renderBelowHeader}

      <View
        style={[
          styles.calendarCard,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          style,
        ]}
      >
        {loading && (
          <View style={styles.calendarLoading}>
            <ActivityIndicator size="small" color={theme.primary} />
            {!!loadingLabel && (
              <Text
                style={[
                  styles.calendarLoadingText,
                  { color: theme.textSecondary },
                ]}
              >
                {loadingLabel}
              </Text>
            )}
          </View>
        )}

        <View style={styles.calendarWeekdays}>
          {weekdayLabels.map((label, index) => (
            <View key={`${label}-${index}`} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  index === 0 && { color: sundayHighlightColor },
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.calendarGrid, gridStyle]}>
          {calendarDays.map(({ date, inCurrentMonth }) => {
            const dayNum = date.getDate();
            const meta = inCurrentMonth ? dayMeta?.[dayNum] : undefined;
            const dateKey = toLocalDateKey(date);
            const isToday = dateKey === todayKey;
            const isSelected = !!selectedKey && dateKey === selectedKey;
            const isSunday = date.getDay() === 0;
            const hasMarker = !!meta?.markerColor;
            const filterDimmed = !!meta?.dimmed;
            const disabled = !inCurrentMonth || !!meta?.disabled || !onDayPress;

            let textColor = theme.textMain;
            if (!inCurrentMonth) {
              textColor = theme.textSecondary + "55";
            } else if (isSelected) {
              textColor = "#FFFFFF";
            } else if (isToday) {
              textColor = todayAccent;
            } else if (isSunday) {
              textColor = sundayHighlightColor;
            } else if (!hasMarker) {
              textColor = theme.textSecondary + "99";
            }

            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.calendarDayCell,
                  isToday && !isSelected && styles.todayCell,
                  isToday &&
                    !isSelected && {
                      borderColor: todayAccent,
                      backgroundColor: todayAccent + "18",
                    },
                  isSelected && {
                    backgroundColor: todayAccent,
                    borderColor: todayAccent,
                    borderRadius: 12,
                  },
                  filterDimmed && inCurrentMonth && { opacity: 0.28 },
                ]}
                onPress={() => {
                  if (disabled) return;
                  onDayPress?.(date, meta);
                }}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      color: textColor,
                      fontWeight:
                        isToday || isSelected
                          ? "800"
                          : inCurrentMonth
                            ? "700"
                            : "500",
                      fontSize: isToday || isSelected ? 14 : 13,
                    },
                    dayTextStyle,
                  ]}
                >
                  {dayNum}
                </Text>

                {hasMarker && !isSelected ? (
                  <View
                    style={[
                      isToday ? styles.dayDotToday : styles.dayDot,
                      { backgroundColor: meta!.markerColor! },
                    ]}
                  />
                ) : isToday && !isSelected ? (
                  <View
                    style={[
                      styles.dayDotToday,
                      { backgroundColor: todayAccent },
                    ]}
                  />
                ) : (
                  <View style={styles.dayDotPlaceholder} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
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
  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.15)",
    paddingBottom: 10,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayCell: {
    width: "14.2857%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  todayCell: {
    borderRadius: 12,
    borderWidth: 2,
  },
  dayNumberText: {
    fontSize: 13,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  dayDotToday: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 4,
  },
  dayDotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 4,
  },
});

export default Calendar;
