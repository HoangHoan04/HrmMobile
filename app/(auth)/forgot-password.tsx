import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { InputOtp } from "@/components/ui/input/InputOtp";
import { InputPassword } from "@/components/ui/input/InputPassword";
import { LanguageChange } from "@/components/common/LanguageChange";
import { Colors } from "@/constants/common/Colors";
import { ROUTES } from "@/constants/common/routes";
import { useForgotPassword } from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { keyboardAvoidingBehavior } from "@/utils/helpers";
import { validatePassword } from "@/utils/validators/password";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const {
    email,
    setEmail,
    sent,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    loading,
    handleSendEmail,
    handleResetPassword,
  } = useForgotPassword();

  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  useEffect(() => {
    if (sent) {
      setStep(2);
    }
  }, [sent]);

  useEffect(() => {
    if (step === 2) {
      setCountdown(30);
    }
  }, [step]);

  useEffect(() => {
    let interval: any;
    if (step === 2 && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, countdown]);

  const handleResendOtp = () => {
    handleSendEmail();
    setCountdown(30);
  };

  const {
    isLengthValid,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  } = validatePassword(newPassword);

  const renderCriteria = (label: string, isValid: boolean) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
      }}
    >
      <Ionicons
        name={isValid ? "checkmark-circle" : "close-circle-outline"}
        size={18}
        color={isValid ? "#10B981" : theme.textSecondary}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: isValid ? "#10B981" : theme.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );

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
        <View style={{ height: 280, position: "relative", overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: -150,
              left: -100,
              width: width * 1.5,
              height: 380,
              borderRadius: width,
              backgroundColor: theme.primary,
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: -120,
              left: -80,
              width: width * 1.3,
              height: 330,
              borderRadius: width,
              backgroundColor: theme.primary,
              transform: [{ scaleX: 1.15 }, { rotate: "-10deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              top: -100,
              left: -50,
              width: width * 1.1,
              height: 290,
              borderRadius: width,
              backgroundColor: theme.primaryActive,
              opacity: 0.7,
              transform: [{ rotate: "-5deg" }],
            }}
          />

          <View
            style={{ position: "absolute", top: 60, right: 24, zIndex: 10 }}
          >
            <LanguageChange color="#FFFFFF" />
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 35,
              left: 32,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255, 255, 255, 0.4)",
              }}
            >
              <Feather name="briefcase" size={26} color="#FFFFFF" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  letterSpacing: 1.5,
                }}
              >
                HRDashboard
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Smart HR Management
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 30,
            paddingBottom: 40,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: theme.background,
            marginTop: -20,
          }}
        >
          {step < 4 ? (
            <>
              <View
                style={{
                  marginBottom: 32,
                  paddingHorizontal: 12,
                  position: "relative",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 15,
                    left: 35,
                    right: 35,
                    height: 3,
                    backgroundColor: theme.border,
                    zIndex: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 15,
                    left: 35,
                    right: step === 3 ? 35 : undefined,
                    width: step === 1 ? "0%" : step === 2 ? "50%" : undefined,
                    height: 3,
                    backgroundColor: theme.primary,
                    zIndex: 2,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    zIndex: 3,
                  }}
                >
                  {[1, 2, 3].map((s) => {
                    const isCompleted = s < step;
                    const isActive = s === step;

                    let label = "";
                    if (s === 1) label = t("forgotPassword.stepEmail");
                    else if (s === 2) label = t("forgotPassword.stepOtp");
                    else label = t("forgotPassword.stepPassword");

                    return (
                      <View key={s} style={{ alignItems: "center", width: 70 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor:
                              isCompleted || isActive
                                ? theme.primary
                                : theme.border,
                            backgroundColor: isCompleted
                              ? theme.primary
                              : isActive
                                ? theme.background
                                : theme.cardBg,
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: isActive
                              ? theme.primary
                              : "transparent",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: isActive ? 2 : 0,
                          }}
                        >
                          {isCompleted ? (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isActive
                                  ? theme.primary
                                  : theme.textSecondary,
                              }}
                            >
                              {s}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isActive ? "700" : "500",
                            color: isActive
                              ? theme.primary
                              : theme.textSecondary,
                            marginTop: 8,
                            textAlign: "center",
                          }}
                        >
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.textMain,
                  marginBottom: 8,
                }}
              >
                {t("forgotPassword.title")}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  marginBottom: 28,
                }}
              >
                {step === 1
                  ? t("forgotPassword.stepEmailHint")
                  : step === 2
                    ? t("forgotPassword.stepOtpHint")
                    : t("forgotPassword.stepPasswordHint")}
              </Text>

              {step === 1 && (
                <View style={{ gap: 20 }}>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("forgotPassword.enterEmail")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: theme.cardBg,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                    leftSlot={
                      <View style={{ paddingLeft: 12, paddingRight: 8 }}>
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={email ? theme.primary : theme.textSecondary}
                        />
                      </View>
                    }
                  />

                  <View style={{ marginTop: 8 }}>
                    <Button
                      onPress={handleSendEmail}
                      isDisabled={loading || !email}
                      isLoading={loading}
                      label={t("forgotPassword.sendRequest")}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      textStyle={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(ROUTES.auth.login)}
                    activeOpacity={0.7}
                    style={{ padding: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.primary,
                        textAlign: "center",
                      }}
                    >
                      {t("forgotPassword.backToLogin")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === 2 && (
                <View style={{ gap: 24 }}>
                  <View
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: theme.cardBg,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        lineHeight: 20,
                      }}
                    >
                      {t("forgotPassword.emailSent")}{" "}
                      <Text
                        style={{ fontWeight: "700", color: theme.textMain }}
                      >
                        {email}
                      </Text>
                      .
                    </Text>
                  </View>

                  <View style={{ gap: 12, alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.textMain,
                        alignSelf: "flex-start",
                      }}
                    >
                      {t("forgotPassword.otp")}
                    </Text>
                    <InputOtp value={otp} onChangeText={setOtp} />
                  </View>

                  <View style={{ alignItems: "center", marginTop: 4 }}>
                    {countdown > 0 ? (
                      <Text
                        style={{ fontSize: 14, color: theme.textSecondary }}
                      >
                        Gửi lại mã sau{" "}
                        {`00:${countdown < 10 ? `0${countdown}` : countdown}`}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: theme.primary,
                          }}
                        >
                          Gửi lại mã OTP
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Button
                      onPress={() => setStep(3)}
                      isDisabled={otp.length < 6}
                      label={t("common.continue")}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      textStyle={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    activeOpacity={0.7}
                    style={{ padding: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      {t("common.back")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === 3 && (
                <View style={{ gap: 20 }}>
                  <View style={{ gap: 10 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.textMain,
                      }}
                    >
                      {t("forgotPassword.newPassword")}
                    </Text>
                    <InputPassword
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={t("forgotPassword.enterNewPassword")}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: theme.cardBg,
                        fontSize: 15,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                      leftSlot={
                        <View style={{ paddingLeft: 12, paddingRight: 8 }}>
                          <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={
                              newPassword ? theme.primary : theme.textSecondary
                            }
                          />
                        </View>
                      }
                    />

                    {newPassword.length > 0 && (
                      <View
                        style={{
                          marginTop: 8,
                          padding: 16,
                          borderRadius: 14,
                          backgroundColor: theme.cardBg,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        {renderCriteria(
                          t("forgotPassword.criteriaLength"),
                          isLengthValid,
                        )}
                        {renderCriteria(
                          t("forgotPassword.criteriaUppercase"),
                          hasUpperCase,
                        )}
                        {renderCriteria(
                          t("forgotPassword.criteriaLowercase"),
                          hasLowerCase,
                        )}
                        {renderCriteria(
                          t("forgotPassword.criteriaNumber"),
                          hasNumber,
                        )}
                        {renderCriteria(
                          t("forgotPassword.criteriaSpecial"),
                          hasSpecialChar,
                        )}
                      </View>
                    )}
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Button
                      onPress={() => handleResetPassword(() => setStep(4))}
                      isDisabled={
                        loading ||
                        !isLengthValid ||
                        !hasUpperCase ||
                        !hasLowerCase ||
                        !hasNumber ||
                        !hasSpecialChar
                      }
                      isLoading={loading}
                      label={t("forgotPassword.resetPassword")}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      textStyle={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => setStep(2)}
                    activeOpacity={0.7}
                    style={{ padding: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      {t("common.back")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View
              style={{ alignItems: "center", paddingVertical: 20, gap: 24 }}
            >
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#E0F2FE",
                  justifyContent: "center",
                  alignItems: "center",
                  ...Platform.select({
                    ios: {
                      shadowColor: "#0284C7",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                }}
              >
                <View
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    backgroundColor: "#0284C7",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark-done" size={42} color="#FFFFFF" />
                </View>
              </View>

              <View
                style={{ alignItems: "center", gap: 10, paddingHorizontal: 12 }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: theme.textMain,
                    textAlign: "center",
                  }}
                >
                  {t("forgotPassword.successTitle")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {t("forgotPassword.successDesc")}
                </Text>
              </View>

              <View style={{ width: "100%", marginTop: 12 }}>
                <Button
                  onPress={() => router.push(ROUTES.auth.login)}
                  label={t("forgotPassword.backToLogin")}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: theme.primary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  textStyle={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
