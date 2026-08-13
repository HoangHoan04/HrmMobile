import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type HubItem = {
  id: string;
  titleKey: string;
  descKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
  color: string;
};

export default function MoreHubScreen() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  const items = useMemo<HubItem[]>(
    () => [
      {
        id: "ot",
        titleKey: "more.ot",
        descKey: "more.otDesc",
        icon: "time-outline",
        route: "/more/ot",
        color: "#F97316",
      },
      {
        id: "team-calendar",
        titleKey: "more.teamCalendar",
        descKey: "more.teamCalendarDesc",
        icon: "calendar-outline",
        route: "/more/team-calendar",
        color: "#22C55E",
      },
      {
        id: "team-attendance",
        titleKey: "more.teamAttendance",
        descKey: "more.teamAttendanceDesc",
        icon: "people-outline",
        route: "/more/team-attendance",
        color: "#3B82F6",
      },
      {
        id: "contracts",
        titleKey: "more.contracts",
        descKey: "more.contractsDesc",
        icon: "document-text-outline",
        route: "/more/contracts",
        color: "#06B6D4",
      },
      {
        id: "files",
        titleKey: "more.files",
        descKey: "more.filesDesc",
        icon: "folder-outline",
        route: "/more/files",
        color: "#8B5CF6",
      },
      {
        id: "directory",
        titleKey: "more.directory",
        descKey: "more.directoryDesc",
        icon: "search-outline",
        route: "/more/directory",
        color: "#64748B",
      },
      {
        id: "org-chart",
        titleKey: "more.orgChart",
        descKey: "more.orgChartDesc",
        icon: "git-network-outline",
        route: "/more/org-chart",
        color: "#0EA5E9",
      },
      {
        id: "workflow",
        titleKey: "more.workflowInbox",
        descKey: "more.workflowInboxDesc",
        icon: "checkmark-done-outline",
        route: "/more/workflow-inbox",
        color: "#10B981",
      },
      {
        id: "performance",
        titleKey: "more.performance",
        descKey: "more.performanceDesc",
        icon: "trophy-outline",
        route: "/more/performance",
        color: "#EAB308",
      },
      {
        id: "training",
        titleKey: "more.training",
        descKey: "more.trainingDesc",
        icon: "school-outline",
        route: "/more/training",
        color: "#A855F7",
      },
      {
        id: "interviews",
        titleKey: "more.interviews",
        descKey: "more.interviewsDesc",
        icon: "briefcase-outline",
        route: "/more/interviews",
        color: "#F43F5E",
      },
      {
        id: "announcements",
        titleKey: "more.announcements",
        descKey: "more.announcementsDesc",
        icon: "newspaper-outline",
        route: "/more/announcements",
        color: "#EF4444",
      },
      {
        id: "manager",
        titleKey: "more.managerDashboard",
        descKey: "more.managerDashboardDesc",
        icon: "stats-chart-outline",
        route: "/more/manager-dashboard",
        color: "#2563EB",
      },
      {
        id: "security",
        titleKey: "more.security",
        descKey: "more.securityDesc",
        icon: "finger-print-outline",
        route: "/more/security",
        color: "#334155",
      },
    ],
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t("more.subtitle")}
        </Text>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.75}
            onPress={() => router.push(item.route)}
          >
            <View
              style={[styles.iconWrap, { backgroundColor: item.color + "18" }]}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: theme.textMain }]}>
                {t(item.titleKey)}
              </Text>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                {t(item.descKey)}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  subtitle: { fontSize: 13, fontWeight: "500", marginBottom: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});
