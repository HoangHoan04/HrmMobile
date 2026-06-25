import { Colors } from "@/constants/Colors";
import React, { useRef, createRef, useState } from "react";
import { useColorScheme, View, TextInput } from "react-native";

interface InputOtpProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
}

export const InputOtp = ({
  length = 6,
  value,
  onChangeText,
}: InputOtpProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const refs = useRef(
    Array.from({ length }, () => createRef<any>())
  );

  const handleChange = (text: string, index: number) => {
    const chars = value.split("");
    chars[index] = text;
    const newValue = chars.join("").slice(0, length);
    onChangeText(newValue);

    if (text && index < length - 1) {
      refs.current[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1].current?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
      {Array.from({ length }, (_, i) => {
        const isFocused = focusedIndex === i;
        const isFilled = !!value[i];

        return (
          <View
            key={i}
            style={{
              width: 48,
              height: 48,
              borderColor: isFocused ? theme.primary : isFilled ? theme.border : theme.border,
              backgroundColor: theme.cardBg,
              borderWidth: 1,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              ref={refs.current[i]}
              maxLength={1}
              value={value[i] || ""}
              onChangeText={(t: string) => handleChange(t, i)}
              onKeyPress={(e: any) => handleKeyPress(e, i)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              textAlign="center"
              style={{
                color: theme.textMain,
                fontSize: 20,
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
