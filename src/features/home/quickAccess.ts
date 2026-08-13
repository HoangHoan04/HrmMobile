import type { Href } from "expo-router";

export type QuickAccessItem = {
  id: string;
  label: string;
  icon: string;
  iconType: "Ionicons" | "MaterialCommunityIcons";
  route: Href;
  color: string;
  bg: string;
};

type TranslateFn = (key: string) => string;

export function getQuickAccessItems(t: TranslateFn): QuickAccessItem[] {
  return [
    {
      id: "chamcong",
      label: t("home.quickAccessAttendance"),
      icon: "finger-print",
      iconType: "Ionicons",
      route: "/(tabs)/checkin" as Href,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      id: "nghiphep",
      label: t("home.quickAccessLeave"),
      icon: "calendar-check-outline",
      iconType: "MaterialCommunityIcons",
      route: "/(tabs)/leave" as Href,
      color: "#22C55E",
      bg: "rgba(34,197,94,0.12)",
    },
    {
      id: "bangcong",
      label: t("home.quickAccessWorksheet"),
      icon: "clipboard-outline",
      iconType: "Ionicons",
      route: "/(tabs)/checkin" as Href,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
    },
    {
      id: "bangluong",
      label: t("home.quickAccessSalary"),
      icon: "wallet-outline",
      iconType: "Ionicons",
      route: "/(tabs)/salary" as Href,
      color: "#06B6D4",
      bg: "rgba(6,182,212,0.12)",
    },
    {
      id: "more",
      label: t("home.quickAccessMore"),
      icon: "grid-outline",
      iconType: "Ionicons",
      route: "/more" as Href,
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.12)",
    },
    {
      id: "ot",
      label: t("home.quickAccessOt"),
      icon: "time-outline",
      iconType: "Ionicons",
      route: "/more/ot" as Href,
      color: "#F97316",
      bg: "rgba(249,115,22,0.12)",
    },
    {
      id: "workflow",
      label: t("home.quickAccessWorkflow"),
      icon: "checkmark-done-outline",
      iconType: "Ionicons",
      route: "/more/workflow-inbox" as Href,
      color: "#10B981",
      bg: "rgba(16,185,129,0.12)",
    },
    {
      id: "announcements",
      label: t("home.quickAccessAnnouncements"),
      icon: "newspaper-outline",
      iconType: "Ionicons",
      route: "/more/announcements" as Href,
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
    },
    {
      id: "directory",
      label: t("home.quickAccessDirectory"),
      icon: "people-outline",
      iconType: "Ionicons",
      route: "/more/directory" as Href,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      id: "profile",
      label: t("home.quickAccessProfile"),
      icon: "person-outline",
      iconType: "Ionicons",
      route: "/(tabs)/profile" as Href,
      color: "#64748B",
      bg: "rgba(100,116,139,0.12)",
    },
  ];
}
