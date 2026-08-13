import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import {
  DirectoryPerson,
  useDirectory,
} from "@/features/more/hooks/useProfileMore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React, { useMemo, useState } from "react";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";

function normalizeList(data: unknown): DirectoryPerson[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as { items?: DirectoryPerson[]; data?: DirectoryPerson[] };
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export default function DirectoryScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const [search, setSearch] = useState("");
  const { data, isLoading, isRefetching, error, refetch } = useDirectory(search);
  const people = useMemo(() => normalizeList(data), [data]);

  return (
    <MoreListShell
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      error={error}
      empty={!isLoading && people.length === 0}
      emptyText={t("phaseM.directory.empty")}
      headerExtra={
        <View style={styles.searchWrap}>
          <TextInput
            style={[
              styles.search,
              {
                color: theme.textMain,
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
              },
            ]}
            placeholder={t("phaseM.directory.search")}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      }
    >
      {people.map((p, idx) => (
        <MoreCard
          key={p.id || String(idx)}
          onPress={() => {
            if (p.phone) void Linking.openURL(`tel:${p.phone}`);
          }}
        >
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {p.fullName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {p.employeeCode || "—"} · {p.positionName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
            {p.departmentName || "—"}
          </Text>
          {(p.phone || p.email) && (
            <Text style={{ color: theme.primary, marginTop: 6 }}>
              {[p.phone, p.email].filter(Boolean).join(" · ")}
            </Text>
          )}
        </MoreCard>
      ))}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
});
