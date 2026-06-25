import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors } from "@/constants/Colors";
import { useColorScheme, View, Text } from "react-native";
import { Card } from "@/components/common/Card";

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <View style={{ gap: 24 }}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <View style={{ backgroundColor: theme.primary, width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 18 }}>
                {user?.name?.charAt(0) ?? "U"}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.textMain }}>{user?.name ?? "Nhân viên"}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                {user?.role ?? "---"}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Card padding={16}>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                Công
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.textMain }}>0</Text>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card padding={16}>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                Nghỉ
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.textMain }}>0</Text>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card padding={16}>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                Đơn
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.textMain }}>0</Text>
            </Card>
          </View>
        </View>
      </View>
    </View>
  );
}
