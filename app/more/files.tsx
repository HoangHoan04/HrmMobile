import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useMyFiles } from "@/features/more/hooks/useProfileMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Linking, Text } from "react-native";

export default function FilesScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { data = [], isLoading, isRefetching, error, refetch } = useMyFiles();

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && data.length === 0}
      emptyText={t("phaseM.files.empty")}
    >
      {data.map((item, idx) => (
        <MoreCard
          key={item.id || String(idx)}
          onPress={() => {
            if (item.fileUrl) void Linking.openURL(item.fileUrl);
          }}
        >
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {item.fileName || item.documentType || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {item.documentType || item.fileType || "—"}
          </Text>
          {!!item.note && (
            <Text style={{ color: theme.textMain, marginTop: 6 }}>
              {item.note}
            </Text>
          )}
        </MoreCard>
      ))}
    </MoreListShell>
  );
}
