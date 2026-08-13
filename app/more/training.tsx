import { Colors } from "@/constants/common/Colors";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { useTraining } from "@/features/more/hooks/useTraining";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function TrainingScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const [courseId, setCourseId] = useState<string | null>(null);
  const {
    courses,
    enrollments,
    results,
    quizzes,
    loading,
    refreshing,
    refetch,
    submitQuiz,
    submitting,
  } = useTraining(courseId);

  return (
    <MoreListShell
      loading={loading && courses.length === 0}
      refreshing={refreshing}
      onRefresh={() => void refetch()}
      empty={false}
    >
      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.training.courses")}
      </Text>
      {courses.map((c, idx) => {
        const id = c.id || "";
        const active = courseId === id;
        return (
          <MoreCard
            key={id || String(idx)}
            onPress={() => setCourseId(id || null)}
          >
            <Text style={{ color: theme.textMain, fontWeight: "800" }}>
              {c.name || c.title || "—"}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {c.status || "—"}
              {active ? ` · ${t("phaseM.training.selected")}` : ""}
            </Text>
          </MoreCard>
        );
      })}

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.training.enrollments")}
      </Text>
      {enrollments.map((e, idx) => (
        <MoreCard key={e.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {e.courseName || "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {e.progressPercent ?? 0}% · {e.status || "—"}
          </Text>
        </MoreCard>
      ))}

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.training.results")}
      </Text>
      {results.map((r, idx) => (
        <MoreCard key={r.id || String(idx)}>
          <Text style={{ color: theme.textMain, fontWeight: "800" }}>
            {r.courseName || "—"}
          </Text>
          <Text style={{ color: theme.primary, marginTop: 4, fontWeight: "700" }}>
            {r.score ?? "—"}
            {r.passed != null
              ? r.passed
                ? ` · ${t("phaseM.training.passed")}`
                : ` · ${t("phaseM.training.failed")}`
              : ""}
          </Text>
        </MoreCard>
      ))}

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        {t("phaseM.training.quizzes")}
      </Text>
      {!courseId ? (
        <Text style={{ color: theme.textSecondary }}>
          {t("phaseM.training.pickCourse")}
        </Text>
      ) : quizzes.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>{t("phaseM.empty")}</Text>
      ) : (
        quizzes.map((q, idx) => (
          <MoreCard key={q.id || String(idx)}>
            <Text style={{ color: theme.textMain, fontWeight: "800" }}>
              {q.title || "—"}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {t("phaseM.training.questionCount", {
                n: q.questionCount ?? 0,
              })}
            </Text>
            {!!q.id && (
              <TouchableOpacity
                style={[styles.quizBtn, { borderColor: theme.primary }]}
                disabled={submitting}
                onPress={() =>
                  void submitQuiz({ quizId: q.id!, note: "mobile-stub" })
                }
              >
                <Text style={{ color: theme.primary, fontWeight: "700" }}>
                  {t("phaseM.training.submitQuiz")}
                </Text>
              </TouchableOpacity>
            )}
          </MoreCard>
        ))
      )}
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
  quizBtn: {
    marginTop: 10,
    borderWidth: 1.2,
    borderRadius: 10,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
});
