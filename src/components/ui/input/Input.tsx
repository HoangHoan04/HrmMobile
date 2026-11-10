import { Colors } from "@/constants/common/Colors";
import React, { useState } from "react";
import {
  useColorScheme,
  View,
  TextInput,
  type TextInputProps,
} from "react-native";

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
  /** Extra props forwarded to the underlying TextInput. */
  inputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder" | "secureTextEntry" | "style"
  >;
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
  inputProps,
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
        editable={!isDisabled && !isReadOnly}
        {...inputProps}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps?.onBlur?.(e);
        }}
      />
      {rightSlot}
    </View>
  );
};
