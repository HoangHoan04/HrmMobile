import { Button } from "@/components/ui/button/Button";
import { showAlert } from "@/components/ui/confirm";
import { Checkbox } from "@/components/ui/input/Checkbox";
import { Input } from "@/components/ui/input/Input";
import { InputPassword } from "@/components/ui/input/InputPassword";
import { LanguageChange } from "@/components/common/LanguageChange";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@/components/ui/Modal";
import { Colors } from "@/constants/common/Colors";
import { ROUTES } from "@/constants/common/routes";
import { showToastError } from "@/helper/ToastEventEmitter";
import { useLogin } from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { keyboardAvoidingBehavior } from "@/utils/helpers";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
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

  const [isHrModalOpen, setIsHrModalOpen] = useState(false);

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
      bg: "#F0FDF4",
      color: "#16A34A",
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

  const handleSocialLogin = (platform: string) => {
    showAlert(
      t("login.socialTitle"),
      t("login.socialUnsupported", { platform }),
      { variant: "info" },
    );
  };

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
              opacity: 0.75,
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
              bottom: 100,
              left: 32,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <Feather name="briefcase" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  letterSpacing: 1,
                }}
              >
                SmartHRM
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: "500",
                  marginTop: 1,
                }}
              >
                Hệ thống quản lý nhân sự
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 40,
            backgroundColor: theme.background,
            marginTop: -25,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 24,
              padding: 24,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: theme.textMain,
                marginBottom: 6,
              }}
            >
              {t("login.title")}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 24,
              }}
            >
              Login first to your account
            </Text>

            <View style={{ gap: 16 }}>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder={t("login.username")}
                autoCapitalize="none"
                style={{
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: theme.background,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                leftSlot={
                  <View style={{ paddingLeft: 12, paddingRight: 6 }}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={username ? theme.primary : theme.textSecondary}
                    />
                  </View>
                }
              />

              <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder={t("login.password")}
                style={{
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: theme.background,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                leftSlot={
                  <View style={{ paddingLeft: 12, paddingRight: 6 }}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={password ? theme.primary : theme.textSecondary}
                    />
                  </View>
                }
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Checkbox
                  isChecked={rememberMe}
                  onChange={setRememberMe}
                  label={t("login.rememberMe")}
                />

                <TouchableOpacity
                  onPress={() => router.push(ROUTES.auth.forgotPassword)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: theme.primary,
                      paddingVertical: 4,
                    }}
                  >
                    {t("login.forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 8 }}>
                <Button
                  onPress={handleLogin}
                  isDisabled={loading || !username || !password}
                  isLoading={loading}
                  label={loading ? t("common.processing") : t("login.title")}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: theme.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    ...Platform.select({
                      ios: {
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                      },
                      android: {
                        elevation: 3,
                      },
                    }),
                  }}
                  textStyle={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 14,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: theme.border }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginHorizontal: 12,
                    fontWeight: "500",
                  }}
                >
                  Or sign in with
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: theme.border }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  {t("auth.noAccount")}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsHrModalOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: theme.primary,
                    }}
                  >
                    {t("auth.contactHr")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal isOpen={isHrModalOpen} onClose={() => setIsHrModalOpen(false)}>
        <ModalContent
          style={{ width: "95%", alignSelf: "center", maxWidth: 480 }}
        >
          <ModalHeader>
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: theme.background,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather name="phone" size={18} color={theme.primary} />
                </View>
                <View>
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
                      fontSize: 11,
                      color: theme.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    {t("auth.modalSubtitle")}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsHrModalOpen(false)}
              style={{ padding: 4 }}
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </ModalHeader>

          <ModalBody>
            <Text
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                lineHeight: 18,
                marginBottom: 16,
              }}
            >
              {t("auth.modalBody")}
            </Text>

            <View style={{ gap: 12, marginBottom: 16 }}>
              {hrContacts.map((hr, idx) => (
                <View
                  key={idx}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: theme.cardBg,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: hr.bg,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
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
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 2,
                        }}
                      >
                        <Text
                          style={{ fontSize: 11, color: theme.textSecondary }}
                        >
                          {hr.dept}
                        </Text>
                        <Text
                          style={{ fontSize: 11, color: theme.textSecondary }}
                        >
                          •
                        </Text>
                        <Text
                          style={{ fontSize: 11, color: theme.textSecondary }}
                        >
                          Ext: {hr.ext}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleCall(hr.phone)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: theme.background,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <Feather name="phone" size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEmail(hr.email)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: theme.background,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <Feather name="mail" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 8,
              }}
            >
              <Feather name="clock" size={16} color={theme.textSecondary} />
              <View>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                  {t("auth.modalHours")}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.textMain,
                    marginTop: 1,
                  }}
                >
                  {t("auth.modalHoursVal")}
                </Text>
              </View>
            </View>

            <Button
              onPress={() => setIsHrModalOpen(false)}
              label={t("auth.modalClose")}
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: theme.primary,
                marginTop: 8,
              }}
              textStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </KeyboardAvoidingView>
  );
}
