import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function MoreLayout() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  const handleSubScreenBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/more");
    }
  };

  const handleIndexBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.cardBg },
        headerTintColor: theme.textMain,
        headerTitleStyle: { fontWeight: "700", fontSize: 16 },
        headerShadowVisible: false,
        headerBackVisible: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
        headerLeft: () => (
          <TouchableOpacity
            onPress={handleSubScreenBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 30,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={theme.textMain} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("more.title"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleSubScreenBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                width: 30,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={theme.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="attendance-complaints"
        options={{ title: t("more.complaints") }}
      />
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
