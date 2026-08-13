import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import {
  OrgChartNode,
  useOrgChart,
} from "@/features/more/hooks/useProfileMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

function flatten(
  node: OrgChartNode | OrgChartNode[] | null | undefined,
  depth = 0,
): { node: OrgChartNode; depth: number }[] {
  if (!node) return [];
  if (Array.isArray(node)) {
    return node.flatMap((n) => flatten(n, depth));
  }
  const self = { node, depth };
  const kids = Array.isArray(node.children)
    ? node.children.flatMap((c) => flatten(c, depth + 1))
    : [];
  return [self, ...kids];
}

export default function OrgChartScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { data, isLoading, isRefetching, error, refetch } = useOrgChart();
  const rows = useMemo(() => flatten(data as OrgChartNode), [data]);

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && rows.length === 0}
      emptyText={t("phaseM.orgChart.empty")}
    >
      {rows.map(({ node, depth }, idx) => (
        <View key={node.id || String(idx)} style={{ paddingLeft: depth * 14 }}>
          <MoreCard>
            <Text style={{ color: theme.textMain, fontWeight: "800" }}>
              {String(node.name || node.title || "—")}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {String(
                (node as any).positionName ||
                  (node as any).title ||
                  node.employeeCode ||
                  "—",
              )}
            </Text>
          </MoreCard>
        </View>
      ))}
    </MoreListShell>
  );
}
