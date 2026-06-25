import React from "react";
import { useColorScheme, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { Card } from "@/components/common/Card";
import { Ionicons } from "@expo/vector-icons";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function NotificationScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { language } = useLanguageStore();

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
        <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.textMain }}>
          {language === "vi" ? "Chưa có thông báo nào" : "No notifications yet"}
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", paddingHorizontal: 32 }}>
          {language === "vi" 
            ? "Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới." 
            : "We will notify you when there is a new update."}
        </Text>
      </View>
    </View>
  );
}
