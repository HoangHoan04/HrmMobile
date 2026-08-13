import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useWorkflowInbox } from "@/features/more/hooks/useWorkflow";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkflowInboxScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { items, loading, refreshing, refetch, advance, reject, acting } =
    useWorkflowInbox();

  return (
    <MoreListShell
      loading={loading && items.length === 0}
      refreshing={refreshing}
      onRefresh={() => void refetch()}
      empty={!loading && items.length === 0}
      emptyText={t("phaseM.workflow.empty")}
    >
      {items.map((item, idx) => {
        const id = item.id || item.requestId;
        return (
          <MoreCard key={id || String(idx)}>
            <Text style={{ color: theme.textMain, fontWeight: "800" }}>
              {item.title || item.requestType || "—"}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {item.requesterName || "—"} · {item.status || "—"}
            </Text>
            {!!item.createdAt && (
              <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
                {item.createdAt}
              </Text>
            )}
            {!!id && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { borderColor: "#EF4444" }]}
                  disabled={acting}
                  onPress={() => void reject({ id })}
                >
                  <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                    {t("phaseM.workflow.reject")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#16A34A" }]}
                  disabled={acting}
                  onPress={() => void advance({ id })}
                >
                  {acting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {t("phaseM.workflow.approve")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </MoreCard>
        );
      })}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
});
