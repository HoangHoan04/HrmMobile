import { Colors } from "@/constants/Colors";
import React from "react";
import { useColorScheme, View } from "react-native";

interface CustomDividerProps {
  orientation?: "vertical" | "horizontal";
  marginVertical?: number;
  marginHorizontal?: number;
}

export const Divider = ({
  orientation = "horizontal",
  marginVertical = 0,
  marginHorizontal = 0,
}: CustomDividerProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        backgroundColor: theme.border,
        marginVertical,
        marginHorizontal,
        width: orientation === "horizontal" ? "100%" : 1,
        height: orientation === "vertical" ? "100%" : 1,
      }}
    />
  );
};
