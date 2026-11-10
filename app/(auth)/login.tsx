import {
  AuthField,
  AuthInputIcon,
  useAuthInputStyle,
} from "@/components/auth/AuthField";
import { AuthHero, SHEET_OVERLAP } from "@/components/auth/AuthHero";
import { Button } from "@/components/ui/button/Button";
import { Checkbox } from "@/components/ui/input/Checkbox";
import { Input } from "@/components/ui/input/Input";
import { InputPassword } from "@/components/ui/input/InputPassword";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@/components/ui/Modal";
import { Colors } from "@/constants/common/Colors";
import { ROUTES } from "@/constants/common/routes";
import { tryLocalAuth } from "@/features/more/biometric";
import { showToastError } from "@/helper/ToastEventEmitter";
import { useLogin } from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { keyboardAvoidingBehavior } from "@/utils/helpers";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    biometricAvailable,
    loginWithSavedCredentials,
  } = useLogin();

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const inputStyle = useAuthInputStyle();
  const { t } = useLanguageStore();

  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const canSubmit = !!username.trim() && !!password && !loading;

  const hrContacts = [
    {
      name: "Nguyễn Văn A",
      initials: "NA",
      dept: t("auth.modalDeptVal"),
      email: "hr.director@company.com",
      phone: "+84 901 234 567",
      ext: "101",
      bg: "#E0F2FE",
      color: "#0369A1",
    },
    {
      name: "Trần Thị B",
      initials: "TB",
      dept: t("auth.modalDeptVal"),
      email: "recruitment@company.com",
      phone: "+84 902 345 678",
      ext: "102",
      bg: "#DCFCE7",
      color: "#15803D",
    },
  ];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {
      showToastError(t("login.openDialerFailed"));
    });
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      showToastError(t("login.openEmailFailed"));
    });
  };

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true);
    try {
      const result = await tryLocalAuth(t("phaseM.security.prompt"));
      if (!result.available) {
        await loginWithSavedCredentials();
        return;
      }
      if (!result.ok) {
        showToastError(t("phaseM.security.unlockFailed"));
        return;
      }
      await loginWithSavedCredentials();
    } finally {
      setBiometricLoading(false);
    }
  };

  const submit = () => {
    if (canSubmit) handleLogin();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={keyboardAvoidingBehavior}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AuthHero
          showBrand
          brandTagline={t("login.tagline")}
          title={t("login.welcome")}
          subtitle={t("login.subtitle")}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}
        >
          <View style={{ gap: 18 }}>
            <AuthField label={t("login.username")}>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder={t("login.usernamePlaceholder")}
                autoCapitalize="none"
                keyboardType="email-address"
                style={inputStyle}
                inputProps={{
                  autoCorrect: false,
                  autoComplete: "username",
                  textContentType: "username",
                }}
                leftSlot={<AuthInputIcon name="mail" active={!!username} />}
              />
            </AuthField>

            <AuthField label={t("login.password")}>
              <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder={t("login.passwordPlaceholder")}
                style={inputStyle}
                inputProps={{
                  autoComplete: "password",
                  textContentType: "password",
                  returnKeyType: "go",
                  onSubmitEditing: submit,
                }}
                leftSlot={<AuthInputIcon name="lock" active={!!password} />}
              />
            </AuthField>
          </View>

          <View style={styles.optionsRow}>
            <Checkbox
              isChecked={rememberMe}
              onChange={setRememberMe}
              label={t("login.rememberMe")}
            />
            <TouchableOpacity
              onPress={() => router.push(ROUTES.auth.forgotPassword)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={[styles.link, { color: theme.primary }]}>
                {t("login.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <View style={{ flex: 1 }}>
              <Button
                onPress={submit}
                isDisabled={!canSubmit}
                isLoading={loading}
                label={t("login.title")}
                icon={<Feather name="arrow-right" size={18} color="#FFFFFF" />}
                iconPosition="right"
                style={[
                  styles.primaryBtn,
                  canSubmit && {
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 14,
                    elevation: 6,
                  },
                ]}
                textStyle={styles.primaryBtnText}
              />
            </View>

            {biometricAvailable ? (
              <Pressable
                onPress={handleBiometricUnlock}
                disabled={biometricLoading || loading}
                accessibilityRole="button"
                accessibilityLabel={t("login.biometricUnlock")}
                style={({ pressed }) => [
                  styles.bioBtn,
                  {
                    borderColor: isDark ? "#1E3A8A" : "#BFDBFE",
                    backgroundColor: pressed
                      ? isDark
                        ? "#172554"
                        : "#DBEAFE"
                      : isDark
                        ? "#0B1220"
                        : "#EFF6FF",
                    opacity: biometricLoading || loading ? 0.6 : 1,
                  },
                ]}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <Ionicons
                    name="finger-print"
                    size={26}
                    color={theme.primary}
                  />
                )}
              </Pressable>
            ) : null}
          </View>

          <View style={{ flex: 1, minHeight: 32 }} />

          <View
            style={[
              styles.footer,
              {
                borderColor: theme.border,
                backgroundColor: isDark ? "#0C0C0C" : "#F8FAFC",
              },
            ]}
          >
            <View
              style={[
                styles.footerIcon,
                { backgroundColor: isDark ? "#172554" : "#DBEAFE" },
              ]}
            >
              <Feather name="headphones" size={16} color={theme.primary} />
            </View>
            <Text
              style={{ flex: 1, fontSize: 13, color: theme.textSecondary }}
              numberOfLines={2}
            >
              {t("auth.noAccount")}
            </Text>
            <TouchableOpacity
              onPress={() => setIsHrModalOpen(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={[styles.link, { color: theme.primary }]}>
                {t("auth.contactHr")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal isOpen={isHrModalOpen} onClose={() => setIsHrModalOpen(false)}>
        <ModalContent
          style={{ width: "92%", alignSelf: "center", maxWidth: 480 }}
        >
          <ModalHeader>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={[
                  styles.modalIcon,
                  { backgroundColor: isDark ? "#172554" : "#DBEAFE" },
                ]}
              >
                <Feather name="users" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: theme.textMain,
                  }}
                >
                  {t("auth.modalTitle")}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {t("auth.modalSubtitle")}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsHrModalOpen(false)}
              style={{ padding: 4 }}
              hitSlop={8}
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </ModalHeader>

          <ModalBody>
            <Text
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                lineHeight: 19,
                marginBottom: 16,
              }}
            >
              {t("auth.modalBody")}
            </Text>

            <View style={{ gap: 10, marginBottom: 14 }}>
              {hrContacts.map((hr) => (
                <View
                  key={hr.email}
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: hr.bg }]}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: hr.color,
                      }}
                    >
                      {hr.initials}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.textMain,
                      }}
                    >
                      {hr.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {hr.dept} · Ext {hr.ext}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleCall(hr.phone)}
                      style={[
                        styles.roundAction,
                        { backgroundColor: isDark ? "#172554" : "#EFF6FF" },
                      ]}
                    >
                      <Feather name="phone" size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEmail(hr.email)}
                      style={[
                        styles.roundAction,
                        { backgroundColor: isDark ? "#172554" : "#EFF6FF" },
                      ]}
                    >
                      <Feather name="mail" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.hoursRow,
                {
                  backgroundColor: isDark ? "#0C0C0C" : "#F8FAFC",
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="clock" size={16} color={theme.textSecondary} />
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                {t("auth.modalHours")}:{" "}
                <Text style={{ fontWeight: "600", color: theme.textMain }}>
                  {t("auth.modalHoursVal")}
                </Text>
              </Text>
            </View>

            <Button
              onPress={() => setIsHrModalOpen(false)}
              label={t("auth.modalClose")}
              style={{ height: 48, borderRadius: 12, marginTop: 16 }}
              textStyle={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    marginTop: -SHEET_OVERLAP,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bioBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  footerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  roundAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
