import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useTeamAttendance } from "@/features/more/hooks/useTeamAttendance";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TeamAttendanceScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, isLoading, isRefetching, error, refetch } = useTeamAttendance(
    year,
    month,
  );
  const members = data?.members || data?.items || [];

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && members.length === 0}
      emptyText={t("phaseM.teamAttendance.empty")}
      headerExtra={
        <View style={styles.monthRow}>
          <TouchableOpacity
            style={[
              styles.nav,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => shiftMonth(-1)}
          >
            <Ionicons name="chevron-back" size={18} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: theme.textMain }]}>
            {t("phaseM.monthLabel", { m: month, y: year })}
          </Text>
          <TouchableOpacity
            style={[
              styles.nav,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => shiftMonth(1)}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      }
    >
      {members.map((m, idx) => (
        <MoreCard key={m.employeeId || String(idx)}>
          <Text style={[styles.title, { color: theme.textMain }]}>
            {m.employeeName || m.employeeCode || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 6 }}>
            {t("phaseM.teamAttendance.summary", {
              onTime: m.onTimeDays ?? 0,
              late: m.lateDays ?? 0,
              leave: m.leaveDays ?? 0,
              absent: m.absentDays ?? 0,
            })}
          </Text>
        </MoreCard>
      ))}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  nav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontSize: 14, fontWeight: "800" },
  title: { fontSize: 14, fontWeight: "800" },
});
