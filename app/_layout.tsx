import { AppDrawer } from "@/components/layout/drawer";
import { ConfirmContainer } from "@/components/ui/confirm";
import { ToastContainer } from "@/components/ui/Toast";
import { Colors } from "@/constants/common/Colors";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  const initLanguage = useLanguageStore((s) => s.initLanguage);
  const initTheme = useThemeStore((s) => s.initTheme);
  const appTheme = useThemeStore((s) => s.theme);

  const segments = useSegments();
  const router = useRouter();

  const theme = Colors[appTheme];
  const statusBarStyle = appTheme === "dark" ? "light" : "dark";

  useEffect(() => {
    initializeAuth();
    initLanguage();
    initTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isOnboarding = segments[1] === "onboarding";

    if (!onboardingCompleted) {
      if (!isOnboarding) {
        router.replace("/(auth)/onboarding");
      }
    } else {
      if (isAuthenticated) {
        if (inAuthGroup) {
          router.replace("/(tabs)");
        }
      } else {
        if (isOnboarding || !inAuthGroup) {
          router.replace("/(auth)/login");
        }
      }
    }
  }, [isInitialized, isAuthenticated, onboardingCompleted, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar style={statusBarStyle} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.primary,
              marginBottom: 24,
            }}
          >
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
          <Text
            style={{
              fontSize: 12,
              color: theme.textSecondary,
              letterSpacing: 1,
            }}
          >
            VERSION 1.0.0
          </Text>
        </View>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={statusBarStyle} />
      <Slot />
      {isAuthenticated ? <AppDrawer /> : null}
      <ToastContainer />
      <ConfirmContainer />
    </QueryClientProvider>
  );
}
