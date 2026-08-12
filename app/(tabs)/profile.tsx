import { DrawerMenuButton } from "@/components/layout/drawer";
import { showAlert, showConfirm } from "@/components/ui/confirm";
import { ImageUploadButton } from "@/components/ui/upload/ImageUploadButton";
import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";

import { useProfile } from "@/hooks";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useAuthStore } from "@/store/authStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];

  const { profile, loading, refetch } = useProfile();
  const { t } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(profile?.avatarUrl ?? null);
  }, [profile?.avatarUrl]);

  const handleAvatarUploaded = useCallback(
    async (url: string) => {
      const previous = avatarUrl;
      setAvatarUrl(url);
      try {
        await rootApi.post(endpoints.auth.updateProfile, {
          email: profile?.email || user?.email || "",
          phoneNumber: profile?.phone || profile?.phoneNumber || "",
          avatarUrl: url,
        });
        await refetch();
      } catch (error: any) {
        setAvatarUrl(previous);
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          t("profile.updateFail");
        showToastError(
          typeof errorMsg === "string" ? errorMsg : t("profile.updateFail"),
        );
      }
    },
    [
      avatarUrl,
      profile?.email,
      profile?.phone,
      profile?.phoneNumber,
      refetch,
      t,
      user?.email,
    ],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLogout = () => {
    showConfirm({
      title: t("profile.logout"),
      message: t("profile.logoutConfirm"),
      variant: "warning",
      buttons: [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.logout"),
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ],
    });
  };

  const handleMenuPress = (id: string) => {
    if (id === "password") {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(true);
    } else if (id === "settings") {
      setEmail(profile?.email || user?.email || "");
      setPhone(profile?.phone || "");
      setIsSettingsModalOpen(true);
    } else if (id === "help") {
      showAlert(t("profile.helpTitle"), t("profile.helpBody"));
    } else if (id === "about") {
      showAlert(t("profile.aboutTitle"), t("profile.aboutBody"));
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToastError(t("profile.passwordRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      showToastError(t("profile.passwordMismatch"));
      return;
    }
    setModalLoading(true);
    try {
      await rootApi.post(endpoints.auth.changePassword, {
        oldPassword,
        newPassword,
      });
      showToastSuccess(t("profile.passwordSuccess"));
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        t("profile.passwordFail");
      showToastError(
        typeof errorMsg === "string" ? errorMsg : t("profile.passwordFail"),
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!email) {
      showToastError(t("profile.emailRequired"));
      return;
    }
    setModalLoading(true);
    try {
      await rootApi.post(endpoints.auth.updateProfile, {
        email,
        phoneNumber: phone,
        avatarUrl: avatarUrl || undefined,
      });
      showToastSuccess(t("profile.updateSuccess"));
      setIsSettingsModalOpen(false);
      await refetch();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        t("profile.updateFail");
      showToastError(
        typeof errorMsg === "string" ? errorMsg : t("profile.updateFail"),
      );
    } finally {
      setModalLoading(false);
    }
  };

  const displayName =
    profile?.fullName ||
    (user?.username
      ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
      : t("common.employee"));

  const positionLabel = profile?.positionName || profile?.position;
  const companyLabel = profile?.companyName || profile?.company;
  const branchLabel = profile?.branchName || profile?.branch;

  const yearsOfService = (() => {
    if (!profile?.joinDate) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(profile.joinDate);
    if (!match) return null;
    const join = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
    );
    if (Number.isNaN(join.getTime())) return null;
    const years =
      (Date.now() - join.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.floor(years));
  })();

  if (loading && !profile) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top, backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          {t("profile.loading")}
        </Text>
      </View>
    );
  }

  const personalInfo = [
    {
      icon: "id-card-outline",
      label: t("profile.fieldEmployeeCode"),
      value: profile?.employeeCode,
    },
    {
      icon: "call-outline",
      label: t("profile.fieldPhone"),
      value: profile?.phone,
    },
    {
      icon: "mail-outline",
      label: t("profile.fieldEmail"),
      value: profile?.email || user?.email,
    },
    {
      icon: "mail-unread-outline",
      label: t("profile.fieldCompanyEmail"),
      value: profile?.companyEmail,
    },
    {
      icon: "calendar-outline",
      label: t("profile.fieldDateOfBirth"),
      value: profile?.dateOfBirth,
    },
    {
      icon: "location-outline",
      label: t("profile.fieldAddress"),
      value: profile?.address || profile?.permanentAddress,
    },
  ];

  const workInfo = [
    {
      icon: "business-outline",
      label: t("profile.fieldCompany"),
      value: profile?.companyName || profile?.company,
    },
    {
      icon: "git-branch-outline",
      label: t("profile.fieldBranch"),
      value: profile?.branchName || profile?.branch,
    },
    {
      icon: "people-outline",
      label: t("profile.fieldDepartment"),
      value: profile?.departmentName || profile?.department,
    },
    {
      icon: "layers-outline",
      label: t("profile.fieldPart"),
      value: profile?.partName || profile?.part,
    },
    {
      icon: "briefcase-outline",
      label: t("profile.fieldPosition"),
      value: profile?.positionName || profile?.position,
    },
    {
      icon: "calendar-clear-outline",
      label: t("profile.fieldJoinDate"),
      value: profile?.joinDate,
    },
    {
      icon: "checkmark-circle-outline",
      label: t("profile.fieldStatus"),
      value: profile?.status,
    },
    {
      icon: "construct-outline",
      label: t("profile.fieldWorkingMode"),
      value: profile?.workingMode,
    },
  ];

  const menuActions = [
    {
      id: "password",
      icon: "lock-closed-outline",
      label: t("profile.menuPassword"),
    },
    {
      id: "settings",
      icon: "settings-outline",
      label: t("profile.menuSettings"),
    },
    { id: "help", icon: "help-circle-outline", label: t("profile.menuHelp") },
    {
      id: "about",
      icon: "information-circle-outline",
      label: t("profile.menuAbout"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <DrawerMenuButton />
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            {t("profile.title")}
          </Text>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
            onPress={() => handleMenuPress("settings")}
          >
            <Feather name="edit-2" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <ImageUploadButton
            value={avatarUrl}
            fallbackText={displayName}
            mode="image"
            size={84}
            style={styles.avatarWrap}
            onChange={handleAvatarUploaded}
          />

          <Text style={[styles.heroName, { color: theme.textMain }]}>
            {displayName}
          </Text>

          {!!positionLabel && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(59,130,246,0.15)"
                      : "#E1EEFB",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="briefcase-check-outline"
                size={14}
                color={theme.primary}
              />
              <Text style={[styles.roleBadgeText, { color: theme.primary }]}>
                {positionLabel}
              </Text>
            </View>
          )}

          {(!!companyLabel || !!branchLabel) && (
            <Text
              style={[
                styles.heroOrgText,
                { color: theme.textSecondary, marginTop: 8 },
              ]}
            >
              {[companyLabel, branchLabel].filter(Boolean).join(" · ")}
            </Text>
          )}

          <View
            style={[styles.heroDivider, { backgroundColor: theme.border }]}
          />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textMain }]}>
                {profile?.stats?.workDaysThisMonth ?? "--"}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t("profile.statWorkDays")}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textMain }]}>
                {profile?.stats?.leaveDaysRemaining ?? "--"}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t("profile.statLeave")}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textMain }]}>
                {yearsOfService ?? "--"}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t("profile.statYears")}
              </Text>
            </View>
          </View>
        </View>

        <InfoSection
          title={t("profile.sectionPersonal")}
          items={personalInfo}
          theme={theme}
          colorScheme={colorScheme}
        />

        <InfoSection
          title={t("profile.sectionWork")}
          items={workInfo}
          theme={theme}
          colorScheme={colorScheme}
        />

        <View
          style={[
            styles.menuCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          {menuActions.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                idx !== menuActions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              activeOpacity={0.6}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[
                    styles.menuIconWrap,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(59,130,246,0.12)"
                          : "rgba(59,130,246,0.08)",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={theme.primary}
                  />
                </View>
                <Text style={[styles.menuLabel, { color: theme.textMain }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: "#EF4444" }]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutBtnText}>{t("profile.logout")}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          {t("profile.version")}
        </Text>
      </ScrollView>
      <Modal
        visible={isPasswordModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                {t("profile.changePasswordTitle")}
              </Text>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("profile.oldPassword")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("profile.enterOldPassword")}
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={true}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("profile.newPassword")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("profile.enterNewPassword")}
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("profile.confirmPassword")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("profile.enterConfirmPassword")}
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setIsPasswordModalOpen(false)}
                disabled={modalLoading}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.textMain }]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleChangePassword}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>{t("common.save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSettingsModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSettingsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                {t("profile.settingsTitle")}
              </Text>
              <TouchableOpacity onPress={() => setIsSettingsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("profile.fieldEmail")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("profile.enterEmail")}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("profile.fieldPhone")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("profile.enterPhone")}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setIsSettingsModalOpen(false)}
                disabled={modalLoading}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.textMain }]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleUpdateProfile}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {t("common.update")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoSection({
  title,
  items,
  theme,
  colorScheme,
}: {
  title: string;
  items: { icon: string; label: string; value?: string | null }[];
  theme: any;
  colorScheme: "light" | "dark";
}) {
  const { t } = useLanguageStore();
  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      {items.map((item, idx) => (
        <View
          key={item.label}
          style={[
            styles.infoRow,
            idx !== items.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.infoRowLeft}>
            <Ionicons
              name={item.icon as any}
              size={16}
              color={theme.textSecondary}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              {item.label}
            </Text>
          </View>
          <Text
            style={[
              styles.infoValue,
              { color: item.value ? theme.textMain : theme.textSecondary },
            ]}
            numberOfLines={1}
          >
            {item.value || t("profile.notUpdated")}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "500" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrap: { marginBottom: 12 },
  heroName: { fontSize: 19, fontWeight: "800", marginBottom: 8 },
  heroOrgText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  roleBadgeText: { fontSize: 12, fontWeight: "700" },
  heroDivider: { height: 1, width: "100%", marginVertical: 20 },
  statsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 17, fontWeight: "800" },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  statDivider: { width: 1, height: 28 },

  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "50%",
    textAlign: "right",
  },

  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  menuRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { fontSize: 14, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  logoutBtnText: { color: "#EF4444", fontSize: 14, fontWeight: "700" },
  versionText: { fontSize: 11, textAlign: "center", marginBottom: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalBody: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
