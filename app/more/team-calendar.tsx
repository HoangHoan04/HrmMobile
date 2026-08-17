import { DateInput } from "@/components/ui/input/DateInput";
import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useTeamCalendar } from "@/features/more/hooks/useTeamCalendar";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function TeamCalendarScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const defaults = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toIsoDate(from), to: toIsoDate(to) };
  }, []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const { data = [], isLoading, isRefetching, error, refetch } = useTeamCalendar(
    from,
    to,
  );

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && data.length === 0}
      emptyText={t("phaseM.teamCalendar.empty")}
      headerExtra={
        <View style={styles.filters}>
          <DateInput
            value={from}
            label={t("phaseM.from")}
            placeholder={t("phaseM.from")}
            presentation="inline"
            onChange={setFrom}
          />
          <DateInput
            value={to}
            label={t("phaseM.to")}
            placeholder={t("phaseM.to")}
            presentation="inline"
            onChange={setTo}
          />
        </View>
      }
    >
      {data.map((item, idx) => (
        <MoreCard key={item.id || String(idx)}>
          <Text style={[styles.title, { color: theme.textMain }]}>
            {item.employeeName || item.employeeCode || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {item.dayOffConfigName || "—"}
          </Text>
          <Text style={{ color: theme.textMain, marginTop: 6 }}>
            {item.fromDate} → {item.toDate} · {item.totalDays ?? 0}{" "}
            {t("phaseM.days")}
          </Text>
        </MoreCard>
      ))}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 10, marginBottom: 14 },
  title: { fontSize: 14, fontWeight: "800" },
});
