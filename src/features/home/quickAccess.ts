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

/** Colors aligned with Colors.primary / semantic tokens */
export function getQuickAccessItems(t: TranslateFn): QuickAccessItem[] {
  return [
    {
      id: "chamcong",
      label: t("home.quickAccessAttendance"),
      icon: "finger-print",
      iconType: "Ionicons",
      route: "/(tabs)/checkin",
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      id: "nghiphep",
      label: t("home.quickAccessLeave"),
      icon: "calendar-check-outline",
      iconType: "MaterialCommunityIcons",
      route: "/(tabs)/leave",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.12)",
    },
    {
      id: "bangcong",
      label: t("home.quickAccessWorksheet"),
      icon: "clipboard-outline",
      iconType: "Ionicons",
      route: "/(tabs)/checkin",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
    },
    {
      id: "bangluong",
      label: t("home.quickAccessSalary"),
      icon: "wallet-outline",
      iconType: "Ionicons",
      route: "/(tabs)/salary",
      color: "#06B6D4",
      bg: "rgba(6,182,212,0.12)",
    },
    {
      id: "profile",
      label: t("home.quickAccessProfile"),
      icon: "person-outline",
      iconType: "Ionicons",
      route: "/(tabs)/profile",
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      id: "baocao",
      label: t("home.quickAccessReport"),
      icon: "bar-chart-outline",
      iconType: "Ionicons",
      route: "/(tabs)/profile",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
    },
  ];
}
