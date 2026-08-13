import { Colors } from "@/constants/common/Colors";
import {
  getBiometricEnabled,
  setBiometricEnabled,
  tryLocalAuth,
} from "@/features/more/biometric";
import { showToastInfo, showToastSuccess } from "@/helper/ToastEventEmitter";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function SecurityScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getBiometricEnabled().then((v) => {
      setEnabled(v);
      setReady(true);
    });
  }, []);

  const onToggle = async (val: boolean) => {
    if (val) {
      const result = await tryLocalAuth(t("phaseM.security.prompt"));
      if (!result.available) {
        showToastInfo(t("phaseM.security.stubNote"));
      } else if (!result.ok) {
        return;
      }
    }
    await setBiometricEnabled(val);
    setEnabled(val);
    showToastSuccess(
      val
        ? t("phaseM.security.enabled")
        : t("phaseM.security.disabled"),
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.icon, { backgroundColor: "#33415518" }]}>
              <Ionicons name="finger-print" size={20} color="#334155" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.textMain }]}>
                {t("phaseM.security.biometric")}
              </Text>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                {t("phaseM.security.biometricDesc")}
              </Text>
            </View>
          </View>
          <Switch
            value={enabled}
            disabled={!ready}
            onValueChange={onToggle}
            thumbColor={enabled ? theme.primary : "#9CA3AF"}
            trackColor={{ false: theme.border, true: theme.primary + "66" }}
          />
        </View>
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          {t("phaseM.security.stubNote")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800" },
  desc: { fontSize: 12, marginTop: 2 },
  note: { fontSize: 11, marginTop: 14, lineHeight: 16 },
});
