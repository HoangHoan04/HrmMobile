import {
  AuthField,
  AuthInputIcon,
  useAuthInputStyle,
} from "@/components/auth/AuthField";
import { AuthHero, SHEET_OVERLAP } from "@/components/auth/AuthHero";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { InputOtp } from "@/components/ui/input/InputOtp";
import { InputPassword } from "@/components/ui/input/InputPassword";
import { Colors } from "@/constants/common/Colors";
import { ROUTES } from "@/constants/common/routes";
import { useForgotPassword } from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { keyboardAvoidingBehavior } from "@/utils/helpers";
import { validatePassword } from "@/utils/validators/password";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = 1 | 2 | 3 | 4;
const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const {
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    loading,
    handleSendEmail,
    handleResetPassword,
  } = useForgotPassword();

  const [step, setStep] = useState<Step>(1);
  const [countdown, setCountdown] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const inputStyle = useAuthInputStyle();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const goToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.auth.login);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else goToLogin();
  };

  const sendCode = (onSent?: () => void) => {
    handleSendEmail(undefined, {
      onSuccess: () => {
        setCountdown(RESEND_SECONDS);
        onSent?.();
      },
    });
  };

  const {
    isLengthValid,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  } = validatePassword(newPassword);

  const criteria = [
    { label: t("forgotPassword.criteriaLength"), ok: isLengthValid },
    { label: t("forgotPassword.criteriaUppercase"), ok: hasUpperCase },
    { label: t("forgotPassword.criteriaLowercase"), ok: hasLowerCase },
    { label: t("forgotPassword.criteriaNumber"), ok: hasNumber },
    { label: t("forgotPassword.criteriaSpecial"), ok: hasSpecialChar },
  ];
  const score = criteria.filter((c) => c.ok).length;
  const passwordValid = score === criteria.length;
  const mismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;

  const strength =
    score <= 2
      ? {
          level: 1,
          label: t("forgotPassword.strengthWeak"),
          color: theme.danger,
        }
      : score <= 4
        ? {
            level: 2,
            label: t("forgotPassword.strengthMedium"),
            color: theme.warning,
          }
        : {
            level: 3,
            label: t("forgotPassword.strengthStrong"),
            color: theme.success,
          };

  const stepMeta: Record<
    Step,
    {
      icon: React.ComponentProps<typeof Feather>["name"];
      title: string;
      hint: string;
    }
  > = {
    1: {
      icon: "mail",
      title: t("forgotPassword.title"),
      hint: t("forgotPassword.stepEmailHint"),
    },
    2: {
      icon: "shield",
      title: t("forgotPassword.otp"),
      hint: t("forgotPassword.stepOtpHint"),
    },
    3: {
      icon: "key",
      title: t("forgotPassword.newPassword"),
      hint: t("forgotPassword.stepPasswordHint"),
    },
    4: {
      icon: "check-circle",
      title: t("forgotPassword.successTitle"),
      hint: "",
    },
  };
  const stepLabels = [
    t("forgotPassword.stepEmail"),
    t("forgotPassword.stepOtp"),
    t("forgotPassword.stepPassword"),
  ];
  const meta = stepMeta[step];

  const primaryBtnStyle = (enabled: boolean) => [
    styles.primaryBtn,
    enabled && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 6,
    },
  ];

  const subtleBg = isDark ? "#0C0C0C" : "#F8FAFC";

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
          icon={meta.icon}
          title={meta.title}
          subtitle={meta.hint || undefined}
          onBack={step === 4 ? undefined : handleBack}
        >
          {step < 4 ? (
            <View style={{ marginTop: 22 }}>
              <View style={styles.stepBars}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.stepBar,
                      {
                        backgroundColor:
                          s <= step ? "#FFFFFF" : "rgba(255,255,255,0.25)",
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.stepText}>
                {t("forgotPassword.stepOf", { current: step, total: 3 })}
                {"  ·  "}
                {stepLabels[step - 1]}
              </Text>
            </View>
          ) : null}
        </AuthHero>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}
        >
          {step === 1 && (
            <>
              <AuthField label={t("forgotPassword.email")}>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("forgotPassword.enterEmail")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={inputStyle}
                  inputProps={{
                    autoCorrect: false,
                    autoComplete: "email",
                    textContentType: "emailAddress",
                    returnKeyType: "send",
                    onSubmitEditing: () =>
                      email.trim() && !loading && sendCode(() => setStep(2)),
                  }}
                  leftSlot={<AuthInputIcon name="mail" active={!!email} />}
                />
              </AuthField>

              <View style={{ marginTop: 28 }}>
                <Button
                  onPress={() => sendCode(() => setStep(2))}
                  isDisabled={loading || !email.trim()}
                  isLoading={loading}
                  label={t("forgotPassword.sendRequest")}
                  icon={<Feather name="send" size={17} color="#FFFFFF" />}
                  iconPosition="right"
                  style={primaryBtnStyle(!loading && !!email.trim())}
                  textStyle={styles.primaryBtnText}
                />
              </View>

              <View style={{ flex: 1, minHeight: 32 }} />

              <View style={styles.inlineCenter}>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {t("forgotPassword.rememberPassword")}{" "}
                </Text>
                <TouchableOpacity onPress={goToLogin} hitSlop={8}>
                  <Text style={[styles.link, { color: theme.primary }]}>
                    {t("login.title")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View
                style={[
                  styles.emailChip,
                  { backgroundColor: subtleBg, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.chipIcon,
                    { backgroundColor: isDark ? "#172554" : "#DBEAFE" },
                  ]}
                >
                  <Feather name="mail" size={16} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                    {t("forgotPassword.emailSent")}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.textMain,
                      marginTop: 2,
                    }}
                  >
                    {email}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setStep(1)} hitSlop={8}>
                  <Text style={[styles.link, { color: theme.primary }]}>
                    {t("forgotPassword.changeEmail")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 24 }}>
                <AuthField label={t("forgotPassword.enterOtp")}>
                  <InputOtp
                    length={OTP_LENGTH}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </AuthField>
              </View>

              <View style={[styles.inlineCenter, { marginTop: 20 }]}>
                {countdown > 0 ? (
                  <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                    {t("forgotPassword.resendIn", {
                      time: `00:${String(countdown).padStart(2, "0")}`,
                    })}
                  </Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                      {t("forgotPassword.notReceived")}{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => sendCode()}
                      disabled={loading}
                      hitSlop={8}
                    >
                      <Text
                        style={[
                          styles.link,
                          { color: theme.primary, opacity: loading ? 0.5 : 1 },
                        ]}
                      >
                        {t("forgotPassword.resend")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View style={{ marginTop: 28 }}>
                <Button
                  onPress={() => setStep(3)}
                  isDisabled={otp.length < OTP_LENGTH}
                  label={t("common.continue")}
                  icon={
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                  }
                  iconPosition="right"
                  style={primaryBtnStyle(otp.length >= OTP_LENGTH)}
                  textStyle={styles.primaryBtnText}
                />
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View style={{ gap: 18 }}>
                <AuthField label={t("forgotPassword.newPassword")}>
                  <InputPassword
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t("forgotPassword.enterNewPassword")}
                    style={inputStyle}
                    inputProps={{
                      autoComplete: "new-password",
                      textContentType: "newPassword",
                    }}
                    leftSlot={
                      <AuthInputIcon name="lock" active={!!newPassword} />
                    }
                  />
                </AuthField>

                {newPassword.length > 0 && (
                  <View
                    style={[
                      styles.strengthCard,
                      { backgroundColor: subtleBg, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.strengthHeader}>
                      <Text
                        style={{ fontSize: 12, color: theme.textSecondary }}
                      >
                        {t("forgotPassword.strength")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: strength.color,
                        }}
                      >
                        {strength.label}
                      </Text>
                    </View>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3].map((l) => (
                        <View
                          key={l}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                l <= strength.level
                                  ? strength.color
                                  : theme.border,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <View style={styles.criteriaWrap}>
                      {criteria.map((c) => (
                        <View key={c.label} style={styles.criteriaItem}>
                          <Feather
                            name={c.ok ? "check-circle" : "circle"}
                            size={14}
                            color={c.ok ? theme.success : theme.textSecondary}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: c.ok
                                ? theme.textMain
                                : theme.textSecondary,
                            }}
                          >
                            {c.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <AuthField
                  label={t("forgotPassword.confirmPassword")}
                  error={mismatch ? t("forgotPassword.passwordMismatch") : null}
                >
                  <InputPassword
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t("forgotPassword.enterConfirmPassword")}
                    isInvalid={mismatch}
                    style={inputStyle}
                    inputProps={{
                      autoComplete: "new-password",
                      textContentType: "newPassword",
                    }}
                    leftSlot={
                      <AuthInputIcon
                        name="shield"
                        active={!!confirmPassword && !mismatch}
                      />
                    }
                  />
                </AuthField>
              </View>

              <View style={{ marginTop: 28 }}>
                <Button
                  onPress={() => handleResetPassword(() => setStep(4))}
                  isDisabled={
                    loading || !passwordValid || confirmPassword !== newPassword
                  }
                  isLoading={loading}
                  label={t("forgotPassword.resetPassword")}
                  style={primaryBtnStyle(
                    !loading &&
                      passwordValid &&
                      confirmPassword === newPassword,
                  )}
                  textStyle={styles.primaryBtnText}
                />
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <View style={{ alignItems: "center", paddingTop: 12 }}>
                <View
                  style={[
                    styles.successRing,
                    { backgroundColor: isDark ? "#052E16" : "#DCFCE7" },
                  ]}
                >
                  <View
                    style={[
                      styles.successDot,
                      { backgroundColor: theme.success },
                    ]}
                  >
                    <Feather name="check" size={40} color="#FFFFFF" />
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    color: theme.textSecondary,
                    textAlign: "center",
                    marginTop: 24,
                    paddingHorizontal: 8,
                  }}
                >
                  {t("forgotPassword.successDesc")}
                </Text>
              </View>

              <View style={{ flex: 1, minHeight: 32 }} />

              <Button
                onPress={goToLogin}
                label={t("forgotPassword.backToLogin")}
                icon={<Feather name="log-in" size={18} color="#FFFFFF" />}
                iconPosition="right"
                style={primaryBtnStyle(true)}
                textStyle={styles.primaryBtnText}
              />
            </>
          )}
        </View>
      </ScrollView>
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
  stepBars: {
    flexDirection: "row",
    gap: 6,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.3,
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
  link: {
    fontSize: 14,
    fontWeight: "700",
  },
  inlineCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  emailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  strengthCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: -6,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  criteriaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    marginTop: 12,
  },
  criteriaItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 6,
  },
  successRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  successDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
