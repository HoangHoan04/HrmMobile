import { Colors } from "@/constants/Colors";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
interface RadioOption {
  label: string;
  value: string | number;
}

interface CustomRadioProps {
  options: RadioOption[];
  selectedValue: string | number;
  onChange: (value: string | number) => void;
  label?: string;
}

export const RadioButton = ({
  options,
  selectedValue,
  onChange,
  label,
}: CustomRadioProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleSelect = (value: string | number) => {
    if (value === selectedValue) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(value);
  };

  return (
    <View style={{ width: "100%", marginBottom: 12 }}>
      {label ? (
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 8,
            color: theme.textMain,
            fontSize: 12,
          }}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}

      <View style={{ gap: 12 }}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <Pressable
              key={option.value.toString()}
              onPress={() => handleSelect(option.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isSelected ? theme.primary : theme.border,
                backgroundColor: isSelected
                  ? colorScheme === "light"
                    ? "#F0F7FF"
                    : "#1A2F4C"
                  : theme.cardBg,
              }}
            >
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? theme.primary : theme.textSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {isSelected ? (
                  <View
                    style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: theme.primary,
                    }}
                  />
                ) : null}
              </View>

              <Text
                style={{
                  fontWeight: isSelected ? "bold" : "normal",
                  color: isSelected ? theme.primary : theme.textMain,
                  fontSize: 14,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
