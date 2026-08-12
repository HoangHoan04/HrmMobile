import { Colors } from "@/constants/common/Colors";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { useColorScheme, TouchableOpacity } from "react-native";
import { Input } from "./Input";

interface InputPasswordProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  style?: any;
  leftSlot?: React.ReactNode;
}

export const InputPassword = ({
  value,
  onChangeText,
  placeholder,
  isDisabled,
  isInvalid,
  style,
  leftSlot,
}: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      secureTextEntry={!showPassword}
      style={style}
      leftSlot={leftSlot}
      rightSlot={
        <TouchableOpacity
          style={{ paddingHorizontal: 8 }}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      }
    />
  );
};
