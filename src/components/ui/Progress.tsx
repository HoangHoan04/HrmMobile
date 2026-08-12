import { Colors } from "@/constants/common/Colors";
import React from "react";
import { useColorScheme, View } from "react-native";

interface CustomProgressProps {
  value: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  bg?: string;
}

export const Progress = ({
  value,
  size = "md",
  color,
  bg,
}: CustomProgressProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const height =
    size === "xs"
      ? 4
      : size === "sm"
        ? 6
        : size === "lg"
          ? 12
          : size === "xl"
            ? 16
            : 8;

  return (
    <View
      style={{
        width: "100%",
        height,
        backgroundColor: bg || theme.border,
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          height: "100%",
          backgroundColor: color || theme.primary,
          borderRadius: 999,
        }}
      />
    </View>
  );
};
