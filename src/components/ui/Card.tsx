import { Colors } from "@/constants/common/Colors";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, Pressable, useColorScheme, View } from "react-native";

interface CustomCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
}

export const Card = ({
  children,
  onPress,
  padding = 16,
}: CustomCardProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const CardContent = (
    <View
      style={{
        padding,
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colorScheme === "light" ? 0.05 : 0.2,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }], width: "100%" }}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {CardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={{ width: "100%" }}>{CardContent}</View>;
};
