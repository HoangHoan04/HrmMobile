import { useAuthStore } from "@/store/useAuthStore";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { ToastContainer } from "@/components/common/Toast";

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  
  const segments = useSegments();
  const router = useRouter();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      // Đã đăng nhập nhưng đang ở trang login/forgot -> Về trang chính
      router.replace("/(tabs)");
    } else if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập nhưng không ở trong nhóm auth -> Đẩy ra trang login
      router.replace("/(auth)/login");
    }
  }, [isInitialized, isAuthenticated, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.primary, marginBottom: 24 }}>
            Welcome to HRM
          </Text>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.cardBg,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Feather name="briefcase" size={48} color={theme.primary} />
          </View>
        </View>

        <View style={{ paddingBottom: 48, alignItems: "center", gap: 12 }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ fontSize: 12, color: theme.textSecondary, letterSpacing: 1 }}>
            VERSION 1.0.0
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Slot />
      <ToastContainer />
    </>
  );
}

