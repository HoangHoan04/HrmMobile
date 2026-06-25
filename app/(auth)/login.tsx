import { Button } from "@/components/common/button/Button";
import { Checkbox } from "@/components/common/input/Checkbox";
import { Input } from "@/components/common/input/Input";
import { InputPassword } from "@/components/common/input/InputPassword";
import { LanguageChange } from "@/components/common/language/LanguageChange";
import { Colors } from "@/constants/Colors";
import { useLogin } from "@/hooks";
import { useLanguageStore } from "@/store/useLanguageStore";
import { keyboardAvoidingBehavior } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ROUTES } from "@/constants/routes";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    rememberMe,
    setRememberMe,
    handleLogin,
  } = useLogin();

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={keyboardAvoidingBehavior}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={{ height: 260, position: "relative", overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: -120,
              left: -80,
              width: width * 1.3,
              height: 320,
              borderRadius: width,
              backgroundColor: theme.primary,
              transform: [{ scaleX: 1.2 }, { rotate: "-15deg" }],
            }}
          />

          <View
            style={{ position: "absolute", top: 70, right: 30, zIndex: 10 }}
          >
            <LanguageChange color="#FFFFFF" />
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 20,
              right: 40,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 38, fontWeight: "700", color: theme.primary }}
            >
              H R M
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: theme.textMain,
              marginBottom: 24,
            }}
          >
            {t("login.title")}
          </Text>

          <View style={{ gap: 16 }}>
            <View style={{ position: "relative", justifyContent: "center" }}>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder={t("login.username")}
                autoCapitalize="none"
                style={{
                  height: 54,
                  borderRadius: 27,
                  borderWidth: 1,
                  borderColor: theme.border || "#A0AEC0",
                  paddingLeft: 48,
                  backgroundColor: theme.background,
                  color: theme.textMain,
                  fontSize: 16,
                }}
              />
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.textMain}
                style={{ position: "absolute", left: 18 }}
              />
            </View>

            <View style={{ position: "relative", justifyContent: "center" }}>
              <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder={t("login.password")}
                style={{
                  height: 54,
                  borderRadius: 27,
                  borderWidth: 1,
                  borderColor: theme.border || "#A0AEC0",
                  paddingLeft: 48,
                  backgroundColor: theme.background,
                  color: theme.textMain,
                  fontSize: 16,
                }}
              />
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.textMain}
                style={{ position: "absolute", left: 18 }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <Checkbox
                isChecked={rememberMe}
                onChange={setRememberMe}
                label={t("login.rememberMe")}
              />

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.textMain,
                  paddingVertical: 4,
                }}
                onPress={() => router.push(ROUTES.auth.forgotPassword)}
              >
                {t("login.forgotPassword")}
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Button
                onPress={handleLogin}
                isDisabled={loading || !username || !password}
                isLoading={loading}
                label={loading ? t("common.processing") : t("login.title")}
                style={{
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: theme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
