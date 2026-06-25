import { Button } from "@/components/common/button/Button";
import { Input } from "@/components/common/input/Input";
import { InputOtp } from "@/components/common/input/InputOtp";
import { InputPassword } from "@/components/common/input/InputPassword";
import { LanguageChange } from "@/components/common/language/LanguageChange";
import { Colors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import { useForgotPassword } from "@/hooks";
import { useLanguageStore } from "@/store/useLanguageStore";
import { keyboardAvoidingBehavior } from "@/utils/utils";
import { validatePassword } from "@/validators/password";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();

  useEffect(() => {
    if (sent) {
      setStep(2);
    }
  }, [sent]);

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
        gap: 6,
        marginTop: 4,
      }}
    >
      <Ionicons
        name={isValid ? "checkmark-circle" : "close-circle"}
        size={16}
        color={isValid ? "#28A745" : "#A0AEC0"}
      />
      <Text style={{ fontSize: 13, color: isValid ? "#28A745" : "#718096" }}>
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
        {/* SECTION 1: TOP BACKGROUND WAVE */}
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

          {/* Language Change top right */}
          <View
            style={{ position: "absolute", top: 70, right: 30, zIndex: 10 }}
          >
            <LanguageChange color="#FFFFFF" />
          </View>

          {/* HRM Logo text */}
          <View style={{ position: "absolute", bottom: 20, right: 40 }}>
            <Text
              style={{ fontSize: 38, fontWeight: "700", color: theme.primary }}
            >
              H R M
            </Text>
          </View>
        </View>

        {/* SECTION 2: FORM CONTENT */}
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20 }}>
          {/* Sleek Timeline Step Progress Indicator */}
          <View
            style={{
              marginBottom: 28,
              paddingHorizontal: 10,
              position: "relative",
            }}
          >
            {/* Connector Line in Background */}
            <View
              style={{
                position: "absolute",
                top: 14,
                left: 30,
                right: 30,
                height: 2,
                backgroundColor:
                  colorScheme === "light" ? "#E2E8F0" : "#4A5568",
                zIndex: 1,
              }}
            />
            {/* Active Connector Line */}
            <View
              style={{
                position: "absolute",
                top: 14,
                left: 30,
                right: step === 3 ? 30 : undefined,
                width: step === 1 ? "0%" : step === 2 ? "50%" : undefined,
                height: 2,
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
                    {/* Circle */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor:
                          isCompleted || isActive
                            ? theme.primary
                            : colorScheme === "light"
                              ? "#E2E8F0"
                              : "#4A5568",
                        backgroundColor: isCompleted
                          ? theme.primary
                          : isActive
                            ? theme.background
                            : colorScheme === "light"
                              ? "#F7FAFC"
                              : "#2D3748",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isActive ? theme.primary : "#A0AEC0",
                          }}
                        >
                          {s}
                        </Text>
                      )}
                    </View>
                    {/* Label */}
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? theme.primary : "#718096",
                        marginTop: 6,
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
              marginBottom: 24,
            }}
          >
            {t("forgotPassword.title")}
          </Text>

          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <View style={{ gap: 20 }}>
              <View style={{ position: "relative", justifyContent: "center" }}>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("forgotPassword.enterEmail")}
                  keyboardType="email-address"
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
                  name="mail-outline"
                  size={20}
                  color={theme.textMain}
                  style={{ position: "absolute", left: 18 }}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <Button
                  onPress={handleSendEmail}
                  isDisabled={loading}
                  isLoading={loading}
                  label={t("forgotPassword.sendRequest")}
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

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.textMain,
                  textAlign: "center",
                  marginTop: 12,
                }}
                onPress={() => router.push(ROUTES.auth.login)}
              >
                {t("forgotPassword.backToLogin")}
              </Text>
            </View>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <View style={{ gap: 20 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.textSecondary,
                  lineHeight: 22,
                }}
              >
                {t("forgotPassword.emailSent")} {email}.
              </Text>

              {/* Custom OTP input component */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: theme.textMain,
                  }}
                >
                  {t("forgotPassword.otp")}
                </Text>
                <InputOtp value={otp} onChangeText={setOtp} />
              </View>

              <View style={{ marginTop: 12 }}>
                <Button
                  onPress={() => setStep(3)}
                  isDisabled={otp.length < 6}
                  label={t("common.continue")}
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

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.textMain,
                  textAlign: "center",
                  marginTop: 12,
                }}
                onPress={() => setStep(1)}
              >
                {t("common.back")}
              </Text>
            </View>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <View style={{ gap: 20 }}>
              {/* Password Input with validation */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: theme.textMain,
                  }}
                >
                  {t("forgotPassword.newPassword")}
                </Text>
                <View
                  style={{ position: "relative", justifyContent: "center" }}
                >
                  <InputPassword
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t("forgotPassword.enterNewPassword")}
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

                {/* Password validation indicators */}
                {newPassword.length > 0 && (
                  <View style={{ marginTop: 6, paddingHorizontal: 4 }}>
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

              {/* Submit Button */}
              <View style={{ marginTop: 12 }}>
                <Button
                  onPress={handleResetPassword}
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

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.textMain,
                  textAlign: "center",
                  marginTop: 12,
                }}
                onPress={() => setStep(2)}
              >
                {t("common.back")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
