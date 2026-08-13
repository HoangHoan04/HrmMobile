import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Stack } from "expo-router";
import React from "react";

export default function MoreLayout() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.cardBg },
        headerTintColor: theme.textMain,
        headerTitleStyle: { fontWeight: "700", fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("more.title") }} />
      <Stack.Screen name="ot" options={{ title: t("more.ot") }} />
      <Stack.Screen
        name="team-calendar"
        options={{ title: t("more.teamCalendar") }}
      />
      <Stack.Screen
        name="team-attendance"
        options={{ title: t("more.teamAttendance") }}
      />
      <Stack.Screen name="contracts" options={{ title: t("more.contracts") }} />
      <Stack.Screen name="files" options={{ title: t("more.files") }} />
      <Stack.Screen name="directory" options={{ title: t("more.directory") }} />
      <Stack.Screen name="org-chart" options={{ title: t("more.orgChart") }} />
      <Stack.Screen
        name="workflow-inbox"
        options={{ title: t("more.workflowInbox") }}
      />
      <Stack.Screen
        name="performance"
        options={{ title: t("more.performance") }}
      />
      <Stack.Screen name="training" options={{ title: t("more.training") }} />
      <Stack.Screen
        name="interviews"
        options={{ title: t("more.interviews") }}
      />
      <Stack.Screen
        name="announcements"
        options={{ title: t("more.announcements") }}
      />
      <Stack.Screen
        name="manager-dashboard"
        options={{ title: t("more.managerDashboard") }}
      />
      <Stack.Screen name="security" options={{ title: t("more.security") }} />
    </Stack>
  );
}
