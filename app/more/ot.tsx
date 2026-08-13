import { DateInput } from "@/components/ui/input/DateInput";
import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useMyOt } from "@/features/more/hooks/useOt";
import { showToastError } from "@/helper/ToastEventEmitter";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OtScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const { items, loading, refreshing, error, refetch, createOt, creating } =
    useMyOt();
  const [workDate, setWorkDate] = useState("");
  const [minutes, setMinutes] = useState("");
  const [reason, setReason] = useState("");

  const submit = async () => {
    const mins = Number(minutes);
    if (!workDate || !reason.trim() || !Number.isFinite(mins) || mins <= 0) {
      showToastError(t("phaseM.ot.validation"));
      return;
    }
    try {
      await createOt({ workDate, minutes: mins, reason: reason.trim() });
      setMinutes("");
      setReason("");
    } catch {
      //! toasted
    }
  };

  return (
    <MoreListShell
      loading={loading && items.length === 0}
      refreshing={refreshing}
      onRefresh={() => void refetch()}
      error={error}
      empty={false}
      headerExtra={
        <View
          style={[
            styles.form,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.textMain }]}>
            {t("phaseM.ot.createTitle")}
          </Text>
          <DateInput
            value={workDate}
            label={t("phaseM.ot.date")}
            placeholder={t("phaseM.ot.date")}
            presentation="inline"
            onChange={setWorkDate}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme.textMain,
                borderColor: theme.border,
                backgroundColor: theme.background,
              },
            ]}
            keyboardType="number-pad"
            placeholder={t("phaseM.ot.minutes")}
            placeholderTextColor={theme.textSecondary}
            value={minutes}
            onChangeText={setMinutes}
          />
          <TextInput
            style={[
              styles.input,
              styles.reason,
              {
                color: theme.textMain,
                borderColor: theme.border,
                backgroundColor: theme.background,
              },
            ]}
            placeholder={t("phaseM.ot.reason")}
            placeholderTextColor={theme.textSecondary}
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <TouchableOpacity
            style={[styles.submit, { backgroundColor: theme.primary }]}
            onPress={submit}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t("phaseM.ot.submit")}</Text>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          {t("phaseM.ot.empty")}
        </Text>
      ) : (
        items.map((item, idx) => (
          <MoreCard key={item.id || String(idx)}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>
              {item.workDate || item.date || "—"}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {t("phaseM.ot.minutesLabel", {
                n: item.minutes ?? item.overtimeMinutes ?? 0,
              })}
            </Text>
            <Text style={{ color: theme.textMain, marginTop: 6 }}>
              {item.reason || "—"}
            </Text>
            <Text style={[styles.status, { color: theme.primary }]}>
              {item.status || "—"}
            </Text>
          </MoreCard>
        ))
      )}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  form: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  formTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  reason: { minHeight: 72, textAlignVertical: "top" },
  submit: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", paddingVertical: 24 },
  cardTitle: { fontSize: 14, fontWeight: "800" },
  status: { marginTop: 8, fontSize: 12, fontWeight: "700" },
});
