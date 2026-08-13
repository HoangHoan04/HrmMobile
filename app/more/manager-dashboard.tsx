import { Colors } from "@/constants/common/Colors";
import { MoreListShell } from "@/features/more/components/MoreListShell";
import { useManagerDashboard } from "@/features/more/hooks/useMiscMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ManagerDashboardScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { data, isLoading, isRefetching, error, refetch } =
    useManagerDashboard();

  const cards = useMemo(
    () => [
      {
        key: "leave",
        label: t("phaseM.manager.pendingLeave"),
        value: data?.pendingLeaveApprovals ?? 0,
        icon: "calendar-outline" as const,
        color: "#22C55E",
      },
      {
        key: "late",
        label: t("phaseM.manager.teamLate"),
        value: data?.teamLateThisMonth ?? 0,
        icon: "warning-outline" as const,
        color: "#F59E0B",
      },
      {
        key: "contracts",
        label: t("phaseM.manager.expiringContracts"),
        value: data?.expiringContracts ?? 0,
        icon: "document-text-outline" as const,
        color: "#EF4444",
      },
      {
        key: "workflow",
        label: t("phaseM.manager.pendingWorkflow"),
        value: data?.pendingWorkflow ?? 0,
        icon: "checkmark-done-outline" as const,
        color: "#3B82F6",
      },
    ],
    [data, t],
  );

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={false}
    >
      <View style={styles.grid}>
        {cards.map((card) => (
          <View
            key={card.key}
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View
              style={[styles.icon, { backgroundColor: card.color + "18" }]}
            >
              <Ionicons name={card.icon} size={18} color={card.color} />
            </View>
            <Text style={[styles.value, { color: theme.textMain }]}>
              {card.value}
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {card.label}
            </Text>
          </View>
        ))}
      </View>
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: { fontSize: 24, fontWeight: "900" },
  label: { fontSize: 11, fontWeight: "600", marginTop: 4 },
});
