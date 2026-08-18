import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useAnnouncements } from "@/features/more/hooks/useMiscMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Text } from "react-native";

export default function AnnouncementsScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const {
    data = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useAnnouncements();

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && data.length === 0}
      emptyText={t("phaseM.announcements.empty")}
    >
      {data.map((item, idx) => (
        <MoreCard key={item.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {item.title || "—"}
          </Text>
          {!!item.publishedAt && (
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {item.publishedAt}
            </Text>
          )}
          <Text style={{ color: theme.textMain, marginTop: 8, lineHeight: 20 }}>
            {item.body || ""}
          </Text>
        </MoreCard>
      ))}
    </MoreListShell>
  );
}
