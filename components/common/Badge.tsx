import { Colors } from "@/constants/common/Colors";
import React from "react";
import { useColorScheme, View, Text } from "react-native";

interface CustomBadgeProps {
  children: React.ReactNode;
  action?: "error" | "warning" | "success" | "info" | "muted";
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Badge = ({
  children,
  action = "info",
  variant = "solid",
  size = "md",
}: CustomBadgeProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  let bgColor = theme.primary;
  let borderColor = theme.primary;
  let textColor = "#FFFFFF";

  if (action === "success") {
    bgColor = theme.success;
    borderColor = theme.success;
  } else if (action === "error") {
    bgColor = theme.danger;
    borderColor = theme.danger;
  } else if (action === "warning") {
    bgColor = theme.warning;
    borderColor = theme.warning;
  } else if (action === "muted") {
    bgColor = theme.border;
    borderColor = theme.border;
    textColor = theme.textSecondary;
  }

  if (variant === "outline") {
    textColor = bgColor;
    bgColor = "transparent";
  }

  const paddingVertical = size === "sm" ? 2 : size === "lg" ? 6 : 4;
  const paddingHorizontal = size === "sm" ? 6 : size === "lg" ? 12 : 8;
  const fontSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: variant === "outline" ? 1 : 0,
        borderRadius: 999,
        paddingVertical,
        paddingHorizontal,
        alignSelf: "flex-start",
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === BadgeText) {
          return React.cloneElement(child as React.ReactElement<any>, {
            style: { color: textColor, fontSize, fontWeight: "bold" },
          });
        }
        return child;
      })}
    </View>
  );
};

export const BadgeText = ({ children, style }: any) => {
  return <Text style={style}>{children}</Text>;
};

export const BadgeIcon = ({ as: IconComponent, color, ...props }: any) => {
  if (!IconComponent) return null;
  return <IconComponent color={color} size={14} {...props} />;
};
