import { Colors } from "@/constants/common/Colors";
import * as Haptics from "expo-haptics";
import React from "react";
import { useColorScheme, Switch } from "react-native";

interface CustomSwitchProps {
  value?: boolean;
  onToggle?: (value: boolean) => void;
  isDisabled?: boolean;
}

export const InputSwitch = ({ value, onToggle, isDisabled }: CustomSwitchProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleToggle = (val: boolean) => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onToggle) {
      onToggle(val);
    }
  };

  return (
    <Switch
      value={value}
      onValueChange={handleToggle}
      disabled={isDisabled}
      trackColor={{ false: theme.border, true: theme.primary }}
      thumbColor="#FFFFFF"
    />
  );
};
