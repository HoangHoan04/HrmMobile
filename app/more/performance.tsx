import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { usePerformance } from "@/features/more/hooks/usePerformance";
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

export default function PerformanceScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const {
    goals,
    results,
    reviews,
    loading,
    refreshing,
    refetch,
    upsert360,
    saving360,
  } = usePerformance();
  const [score, setScore] = useState("80");
  const [comment, setComment] = useState("");

  const submit360 = async () => {
    const n = Number(score);
    if (!comment.trim() || !Number.isFinite(n)) {
      showToastError(t("phaseM.performance.validation360"));
      return;
    }
    try {
      await upsert360({ score: n, comment: comment.trim() });
      setComment("");
    } catch {
      //! toasted
    }
  };

  return (
    <MoreListShell
      loading={loading && goals.length === 0 && results.length === 0}
      refreshing={refreshing}
      onRefresh={() => void refetch()}
      empty={false}
    >
      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.performance.goals")}
      </Text>
      {goals.length === 0 ? (
        <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>
          {t("phaseM.empty")}
        </Text>
      ) : (
        goals.map((g, idx) => (
          <MoreCard key={g.id || String(idx)}>
            <Text style={{ color: theme.textMain, fontWeight: "800" }}>
              {g.title || g.name || "—"}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {g.cycleName || "—"} · {g.progressPercent ?? 0}%
            </Text>
          </MoreCard>
        ))
      )}

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.performance.results")}
      </Text>
      {results.map((r, idx) => (
        <MoreCard key={r.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {r.title || r.cycleName || "—"}
          </Text>
          <Text style={{ color: theme.primary, marginTop: 4, fontWeight: "700" }}>
            {r.score ?? "—"} {r.rating ? `· ${r.rating}` : ""}
          </Text>
        </MoreCard>
      ))}

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.performance.reviews360")}
      </Text>
      {reviews.map((r, idx) => (
        <MoreCard key={r.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {r.subjectName || r.reviewerName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {r.score ?? "—"} · {r.status || "—"}
          </Text>
          {!!r.comment && (
            <Text style={{ color: theme.textMain, marginTop: 4 }}>
              {r.comment}
            </Text>
          )}
        </MoreCard>
      ))}

      <View
        style={[
          styles.form,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <Text style={{ color: theme.textMain, fontWeight: "800" }}>
          {t("phaseM.performance.form360")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.textMain,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}
          keyboardType="decimal-pad"
          value={score}
          onChangeText={setScore}
          placeholder={t("phaseM.performance.score")}
          placeholderTextColor={theme.textSecondary}
        />
        <TextInput
          style={[
            styles.input,
            styles.comment,
            {
              color: theme.textMain,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}
          multiline
          value={comment}
          onChangeText={setComment}
          placeholder={t("phaseM.performance.comment")}
          placeholderTextColor={theme.textSecondary}
        />
        <TouchableOpacity
          style={[styles.submit, { backgroundColor: theme.primary }]}
          onPress={submit360}
          disabled={saving360}
        >
          {saving360 ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              {t("phaseM.performance.save360")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 8,
  },
  form: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  comment: { minHeight: 72, textAlignVertical: "top" },
  submit: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
