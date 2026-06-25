import React from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors } from "@/constants/Colors";
import { useColorScheme, View, Text } from "react-native";
import { Card } from "@/components/common/Card";
import { Divider } from "@/components/common/Divider";
import { Button } from "@/components/common/button/Button";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <View style={{ gap: 24, alignItems: "center" }}>
        <Card padding={32}>
          <View style={{ alignItems: "center", width: "100%" }}>
            <View style={{ backgroundColor: theme.primary, marginBottom: 16, width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 24 }}>
                {user?.name?.charAt(0) ?? "U"}
              </Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.textMain }}>{user?.name ?? "Nhân viên"}</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
              {user?.email ?? "---"}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
              {user?.role ?? "---"}
            </Text>
          </View>
        </Card>

        <Card padding={16}>
          <View style={{ gap: 16, width: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: theme.textSecondary }}>ID</Text>
              <Text style={{ color: theme.textMain }}>{user?.id ?? "---"}</Text>
            </View>
            <Divider />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: theme.textSecondary }}>Email</Text>
              <Text style={{ color: theme.textMain }}>{user?.email ?? "---"}</Text>
            </View>
          </View>
        </Card>

        <View style={{ width: "100%" }}>
          <Button status="danger" label="Đăng Xuất" onPress={handleLogout} />
        </View>
      </View>
    </View>
  );
}
