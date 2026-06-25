import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { useColorScheme, View, TextInput } from "react-native";

interface CustomTextareaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const Textarea = ({
  value,
  onChangeText,
  placeholder,
  isDisabled,
  isInvalid,
}: CustomTextareaProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        borderColor: isInvalid ? theme.danger : isFocused ? theme.primary : theme.border,
        backgroundColor: isDisabled ? theme.background : theme.cardBg,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!isDisabled}
        multiline
        numberOfLines={4}
        style={{
          color: theme.textMain,
          fontSize: 14,
          textAlignVertical: "top",
          minHeight: 80,
        }}
      />
    </View>
  );
};
