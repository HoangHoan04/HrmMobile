import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { useColorScheme, TouchableOpacity, View, Text } from "react-native";

interface CustomCheckboxProps {
  value?: string;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  isDisabled?: boolean;
}

export const Checkbox = ({
  value,
  isChecked,
  onChange,
  label,
  isDisabled,
}: CustomCheckboxProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleChange = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleChange}
      disabled={isDisabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: isChecked ? 0 : 2,
          borderColor: isChecked ? "transparent" : theme.border,
          backgroundColor: isChecked ? theme.primary : "transparent",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 8,
        }}
      >
        {isChecked && <Feather name="check" size={16} color="#FFFFFF" />}
      </View>
      {label && (
        <Text style={{ color: theme.textMain, fontSize: 14 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
