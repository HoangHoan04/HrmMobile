import { Colors } from "@/constants/common/Colors";
import React, { useState } from "react";
import { useColorScheme, View, TextInput } from "react-native";

interface CustomInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightSlot?: React.ReactNode;
  leftSlot?: React.ReactNode;
  style?: any;
}

export const Input = ({
  value,
  onChangeText,
  placeholder,
  isDisabled,
  isInvalid,
  isReadOnly,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightSlot,
  leftSlot,
  style,
}: CustomInputProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          borderColor: isInvalid
            ? theme.danger
            : isFocused
              ? theme.primary
              : theme.border,
          backgroundColor:
            isDisabled || isReadOnly ? theme.background : theme.cardBg,
          borderWidth: 1,
          borderRadius: 12,
          height: 48,
          paddingHorizontal: 12,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {leftSlot}
      <TextInput
        style={{
          flex: 1,
          color: theme.textMain,
          fontSize: style?.fontSize || 14,
          height: "100%",
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!isDisabled && !isReadOnly}
      />
      {rightSlot}
    </View>
  );
};
