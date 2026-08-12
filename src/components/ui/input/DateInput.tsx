import { Calendar, toMonthStart } from "@/components/ui/calendar";
import { Colors } from "@/constants/common/Colors";
import {
  formatDisplayDate,
  parseInputDateToIso,
  parseWorkDate,
} from "@/features/common";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type DateInputProps = {
  value?: string | null;
  onChange?: (isoDate: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string | null;
  maxDate?: string | null;
  disabled?: boolean;
  presentation?: "modal" | "inline";
  style?: StyleProp<ViewStyle>;
};

function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoOrNull(value?: string | null): string | null {
  if (!value) return null;
  return parseInputDateToIso(value);
}

export function DateInput({
  value,
  onChange,
  placeholder,
  label,
  minDate,
  maxDate,
  disabled,
  presentation = "modal",
  style,
}: DateInputProps) {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();
  const [open, setOpen] = useState(false);

  const isoValue = parseIsoOrNull(value);
  const minIso = parseIsoOrNull(minDate);
  const maxIso = parseIsoOrNull(maxDate);

  const initialMonth = useMemo(() => {
    if (isoValue) return toMonthStart(parseWorkDate(isoValue));
    return toMonthStart(new Date());
  }, [isoValue]);

  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    if (open) setMonth(initialMonth);
  }, [open, initialMonth]);

  const display = isoValue
    ? formatDisplayDate(isoValue, language === "en" ? "en" : "vi")
    : "";

  const dayMeta = useMemo(() => {
    if (!minIso && !maxIso) return undefined;
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const meta: Record<number, { disabled?: boolean; dimmed?: boolean }> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const key = toIsoLocal(new Date(year, monthIndex, day));
      const tooEarly = !!minIso && key < minIso;
      const tooLate = !!maxIso && key > maxIso;
      if (tooEarly || tooLate) {
        meta[day] = { disabled: true, dimmed: true };
      }
    }
    return meta;
  }, [month, minIso, maxIso]);

  const handleSelect = (day: Date) => {
    const iso = toIsoLocal(day);
    if (minIso && iso < minIso) return;
    if (maxIso && iso > maxIso) return;
    onChange?.(iso);
    setOpen(false);
  };

  const picker = (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      selectedDate={isoValue}
      dayMeta={dayMeta}
      onDayPress={handleSelect}
      showCurrentBadge={false}
    />
  );

  return (
    <View style={style}>
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={disabled}
        onPress={() => setOpen((v) => !v)}
        style={[
          styles.trigger,
          {
            borderColor: open ? theme.primary : theme.border,
            backgroundColor: theme.background,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            { color: display ? theme.textMain : theme.textSecondary },
          ]}
          numberOfLines={1}
        >
          {display || placeholder || t("leave.datePlaceholder")}
        </Text>
        <Ionicons
          name={open ? "calendar" : "calendar-outline"}
          size={18}
          color={theme.primary}
        />
      </TouchableOpacity>

      {presentation === "inline" && open ? (
        <View
          style={[
            styles.inlinePanel,
            { borderColor: theme.border, backgroundColor: theme.cardBg },
          ]}
        >
          {picker}
        </View>
      ) : null}

      {presentation === "modal" ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <View style={styles.overlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setOpen(false)}
            />
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.textMain }]}>
                  {label || t("leave.pickDate")}
                </Text>
                <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color={theme.textMain} />
                </TouchableOpacity>
              </View>
              {picker}
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  inlinePanel: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
