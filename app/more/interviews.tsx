import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useMyInterviews } from "@/features/more/hooks/useMiscMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Text } from "react-native";

export default function InterviewsScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { data = [], isLoading, isRefetching, error, refetch } =
    useMyInterviews();

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && data.length === 0}
      emptyText={t("phaseM.interviews.empty")}
    >
      {data.map((item, idx) => (
        <MoreCard key={item.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {item.candidateName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {item.jobTitle || "—"}
            {item.round != null ? ` · R${item.round}` : ""}
          </Text>
          <Text style={{ color: theme.textMain, marginTop: 6 }}>
            {item.scheduledAt || "—"}
          </Text>
          {!!item.location && (
            <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
              {item.location}
            </Text>
          )}
          <Text style={{ color: theme.primary, marginTop: 6, fontWeight: "700" }}>
            {item.status || "—"}
          </Text>
        </MoreCard>
      ))}
    </MoreListShell>
  );
}
