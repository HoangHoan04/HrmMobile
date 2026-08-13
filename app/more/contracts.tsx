import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useMyContracts } from "@/features/more/hooks/useProfileMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Text } from "react-native";

export default function ContractsScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { data = [], isLoading, isRefetching, error, refetch } =
    useMyContracts();

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && data.length === 0}
      emptyText={t("phaseM.contracts.empty")}
    >
      {data.map((item, idx) => (
        <MoreCard key={item.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {item.contractNumber || item.contractTypeName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {item.contractTypeName || "—"}
          </Text>
          <Text style={{ color: theme.textMain, marginTop: 6 }}>
            {item.startDate || "—"} → {item.endDate || "—"}
          </Text>
          <Text style={{ color: theme.primary, marginTop: 6, fontWeight: "700" }}>
            {item.status || "—"}
          </Text>
        </MoreCard>
      ))}
    </MoreListShell>
  );
}
