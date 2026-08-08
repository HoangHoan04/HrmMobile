import { Colors } from "@/constants/common/Colors";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline";
  status?: "primary" | "success" | "danger";
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: any;
  textStyle?: any;
}

export const Button = ({
  label,
  onPress,
  variant = "solid",
  status = "primary",
  isLoading = false,
  isDisabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
}: CustomButtonProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  let buttonBg = theme.primary;
  let buttonActiveBg = theme.primaryActive;
  let textColor = variant === "solid" ? "#FFFFFF" : theme.primary;

  if (status === "success") {
    buttonBg = theme.success;
    buttonActiveBg = colorScheme === "light" ? "#28A745" : "#30D158";
    textColor = variant === "solid" ? "#FFFFFF" : theme.success;
  } else if (status === "danger") {
    buttonBg = theme.danger;
    buttonActiveBg = colorScheme === "light" ? "#D32F2F" : "#FF6961";
    textColor = variant === "solid" ? "#FFFFFF" : theme.danger;
  }

  const isOutline = variant === "outline";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    if (isDisabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: "100%" }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled || isLoading}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            borderRadius: 12,
            paddingHorizontal: 16,
            borderWidth: isOutline ? 1 : 0,
            borderColor: buttonBg,
            backgroundColor: isOutline
              ? "transparent"
              : pressed
                ? buttonActiveBg
                : buttonBg,
            opacity: isDisabled ? 0.4 : 1,
          },
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={isOutline ? buttonBg : "#FFFFFF"} />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <View style={{ marginRight: 8 }}>{icon}</View>
            )}

            <Text style={[{ fontWeight: "bold", color: textColor }, textStyle]}>
              {label}
            </Text>

            {icon && iconPosition === "right" && (
              <View style={{ marginLeft: 8 }}>{icon}</View>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};
