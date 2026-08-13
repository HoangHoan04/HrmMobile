import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MoreListShellProps = {
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  error?: unknown;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
};

export function MoreListShell({
  loading,
  refreshing,
  onRefresh,
  error,
  empty,
  emptyText,
  children,
  headerExtra,
}: MoreListShellProps) {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          ) : undefined
        }
      >
        {headerExtra}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              {t("phaseM.loading")}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={theme.warning}
            />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              {t("phaseM.loadFailed")}
            </Text>
          </View>
        ) : empty ? (
          <View style={styles.center}>
            <Ionicons
              name="file-tray-outline"
              size={40}
              color={theme.textSecondary}
            />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              {emptyText || t("phaseM.empty")}
            </Text>
          </View>
        ) : (
          children
        )}
      </ScrollView>
    </View>
  );
}

export function MoreCard({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];

  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  hint: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
});
