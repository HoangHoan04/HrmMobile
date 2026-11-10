import { Colors } from "@/constants/common/Colors";
import React, { createRef, useRef, useState } from "react";
import { TextInput, useColorScheme, View } from "react-native";

interface InputOtpProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  isInvalid?: boolean;
}

export const InputOtp = ({
  length = 6,
  value,
  onChangeText,
  isInvalid,
}: InputOtpProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const refs = useRef(Array.from({ length }, () => createRef<any>()));

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, "");

    // Pasted / autofilled full code
    if (digits.length > 1) {
      const chars = value.split("");
      for (let i = 0; i < digits.length && index + i < length; i++) {
        chars[index + i] = digits[i];
      }
      const next = chars.join("").slice(0, length);
      onChangeText(next);
      const target = Math.min(index + digits.length, length - 1);
      refs.current[target].current?.focus();
      return;
    }

    const chars = value.padEnd(length, " ").split("");
    chars[index] = digits || " ";
    onChangeText(chars.join("").trimEnd().replace(/ /g, ""));

    if (digits && index < length - 1) {
      refs.current[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1].current?.focus();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        width: "100%",
      }}
    >
      {Array.from({ length }, (_, i) => {
        const isFocused = focusedIndex === i;
        const isFilled = !!value[i];

        return (
          <View
            key={i}
            style={{
              flex: 1,
              maxWidth: 56,
              aspectRatio: 0.88,
              borderColor: isInvalid
                ? theme.danger
                : isFocused
                  ? theme.primary
                  : isFilled
                    ? isDark
                      ? "#3F3F46"
                      : "#CBD5E1"
                    : theme.border,
              backgroundColor: isFocused
                ? isDark
                  ? "#0B1220"
                  : "#EFF6FF"
                : isDark
                  ? "#141416"
                  : "#F8FAFC",
              borderWidth: isFocused ? 2 : 1,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              ref={refs.current[i]}
              maxLength={i === 0 ? length : 1}
              value={value[i] || ""}
              onChangeText={(t: string) => handleChange(t, i)}
              onKeyPress={(e: any) => handleKeyPress(e, i)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              textContentType={i === 0 ? "oneTimeCode" : "none"}
              autoComplete={i === 0 ? "sms-otp" : "off"}
              selectTextOnFocus
              textAlign="center"
              style={{
                color: theme.textMain,
                fontSize: 22,
                fontWeight: "700",
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        );
      })}
    </View>
  );
};
