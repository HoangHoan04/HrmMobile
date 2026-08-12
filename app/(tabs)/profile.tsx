import { DrawerMenuButton } from "@/components/layout/drawer";
import { showAlert, showConfirm } from "@/components/ui/confirm";
import { ImageUploadButton } from "@/components/ui/upload/ImageUploadButton";
import { Colors } from "@/constants/common/Colors";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { useProfile } from "@/hooks";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ThemeColors = (typeof Colors)["light"];
type InfoItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
};

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
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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

  const openContactModal = () => {
    setEmail(profile?.email || user?.email || "");
    setPhone(profile?.phone || profile?.phoneNumber || "");
    setIsContactModalOpen(true);
  };

  const openPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordModalOpen(true);
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

  const handleUpdateContact = async () => {
    if (!email.trim()) {
      showToastError(t("profile.emailRequired"));
      return;
    }
    setModalLoading(true);
    try {
      await rootApi.post(endpoints.auth.updateProfile, {
        email: email.trim(),
        phoneNumber: phone.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      showToastSuccess(t("profile.updateSuccess"));
      setIsContactModalOpen(false);
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
  const employeeCode = profile?.employeeCode;

  const yearsOfService = useMemo(() => {
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
  }, [profile?.joinDate]);

  const stats = useMemo(
    () => [
      {
        value: profile?.stats?.workDaysThisMonth ?? "--",
        label: t("profile.statWorkDays"),
      },
      {
        value: profile?.stats?.onTimeDays ?? "--",
        label: t("profile.statOnTime"),
      },
      {
        value:
          profile?.stats?.leaveDaysRemaining != null
            ? profile.stats.leaveDaysRemaining
            : (yearsOfService ?? "--"),
        label:
          profile?.stats?.leaveDaysRemaining != null
            ? t("profile.statLeave")
            : t("profile.statYears"),
      },
    ],
    [profile?.stats, yearsOfService, t],
  );

  const infoItems = useMemo(() => {
    const personal: InfoItem[] = [
      {
        icon: "call-outline",
        label: t("profile.fieldPhone"),
        value: profile?.phone || profile?.phoneNumber,
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

    const work: InfoItem[] = [
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

    return { personal, work };
  }, [profile, user?.email, t]);

  const visiblePersonal = showAllInfo
    ? infoItems.personal
    : infoItems.personal.filter((i) => !!i.value);
  const visibleWork = showAllInfo
    ? infoItems.work
    : infoItems.work.filter((i) => !!i.value);
  const hiddenCount =
    infoItems.personal.filter((i) => !i.value).length +
    infoItems.work.filter((i) => !i.value).length;

  const softPrimary =
    colorScheme === "dark" ? "rgba(59,130,246,0.16)" : "rgba(59,130,246,0.1)";

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
          <View style={styles.headerSpacer} />
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
            size={88}
            style={styles.avatarWrap}
            onChange={handleAvatarUploaded}
          />

          <Text style={[styles.heroName, { color: theme.textMain }]}>
            {displayName}
          </Text>

          {!!employeeCode && (
            <View
              style={[
                styles.codeChip,
                { backgroundColor: softPrimary, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="id-card-outline"
                size={13}
                color={theme.primary}
              />
              <Text style={[styles.codeChipText, { color: theme.primary }]}>
                {employeeCode}
              </Text>
            </View>
          )}

          {!!positionLabel && (
            <Text
              style={[styles.heroRole, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {positionLabel}
            </Text>
          )}

          {(!!companyLabel || !!branchLabel) && (
            <Text
              style={[styles.heroOrg, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {[companyLabel, branchLabel].filter(Boolean).join(" · ")}
            </Text>
          )}

          <View
            style={[styles.heroDivider, { backgroundColor: theme.border }]}
          />

          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
              <React.Fragment key={stat.label}>
                {idx > 0 && (
                  <View
                    style={[
                      styles.statDivider,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.textMain }]}>
                    {stat.value}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    {stat.label}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionTile,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.75}
            onPress={openContactModal}
          >
            <View style={[styles.actionIcon, { backgroundColor: softPrimary }]}>
              <Ionicons name="create-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: theme.textMain }]}>
              {t("profile.actionEditContact")}
            </Text>
            <Text
              style={[styles.actionHint, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {t("profile.actionEditContactHint")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionTile,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.75}
            onPress={openPasswordModal}
          >
            <View style={[styles.actionIcon, { backgroundColor: softPrimary }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.actionTitle, { color: theme.textMain }]}>
              {t("profile.actionChangePassword")}
            </Text>
            <Text
              style={[styles.actionHint, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {t("profile.actionChangePasswordHint")}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t("profile.sectionPersonal")}
          </Text>
          <InfoRows
            items={visiblePersonal}
            theme={theme}
            emptyLabel={t("profile.notUpdated")}
          />

          <View
            style={[styles.innerDivider, { backgroundColor: theme.border }]}
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textSecondary, marginTop: 4 },
            ]}
          >
            {t("profile.sectionWork")}
          </Text>
          <InfoRows
            items={visibleWork}
            theme={theme}
            emptyLabel={t("profile.notUpdated")}
          />

          {hiddenCount > 0 && (
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setShowAllInfo((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.expandText, { color: theme.primary }]}>
                {showAllInfo
                  ? t("profile.showLess")
                  : t("profile.showMore", { n: hiddenCount })}
              </Text>
              <Ionicons
                name={showAllInfo ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.supportRow,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
          activeOpacity={0.7}
          onPress={() =>
            showAlert(t("profile.helpTitle"), t("profile.helpBody"))
          }
        >
          <View style={styles.supportLeft}>
            <View style={[styles.actionIcon, { backgroundColor: softPrimary }]}>
              <Ionicons
                name="help-buoy-outline"
                size={18}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.supportLabel, { color: theme.textMain }]}>
              {t("profile.menuHelp")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.danger }]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={[styles.logoutBtnText, { color: theme.danger }]}>
            {t("profile.logout")}
          </Text>
        </TouchableOpacity>

        <Pressable
          onPress={() =>
            showAlert(t("profile.aboutTitle"), t("profile.aboutBody"))
          }
        >
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            {t("profile.version")}
          </Text>
        </Pressable>
      </ScrollView>

      <FormModal
        visible={isPasswordModalOpen}
        title={t("profile.changePasswordTitle")}
        theme={theme}
        loading={modalLoading}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        submitLabel={t("common.save")}
        cancelLabel={t("common.cancel")}
      >
        <Field
          theme={theme}
          label={t("profile.oldPassword")}
          placeholder={t("profile.enterOldPassword")}
          value={oldPassword}
          onChangeText={setOldPassword}
          secure
        />
        <Field
          theme={theme}
          label={t("profile.newPassword")}
          placeholder={t("profile.enterNewPassword")}
          value={newPassword}
          onChangeText={setNewPassword}
          secure
        />
        <Field
          theme={theme}
          label={t("profile.confirmPassword")}
          placeholder={t("profile.enterConfirmPassword")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure
        />
      </FormModal>

      <FormModal
        visible={isContactModalOpen}
        title={t("profile.editContactTitle")}
        theme={theme}
        loading={modalLoading}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleUpdateContact}
        submitLabel={t("common.update")}
        cancelLabel={t("common.cancel")}
      >
        <Field
          theme={theme}
          label={t("profile.fieldEmail")}
          placeholder={t("profile.enterEmail")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          theme={theme}
          label={t("profile.fieldPhone")}
          placeholder={t("profile.enterPhone")}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </FormModal>
    </View>
  );
}

function InfoRows({
  items,
  theme,
  emptyLabel,
}: {
  items: InfoItem[];
  theme: ThemeColors;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
        {emptyLabel}
      </Text>
    );
  }

  return (
    <>
      {items.map((item, idx) => (
        <View
          key={`${item.label}-${idx}`}
          style={[
            styles.infoRow,
            idx !== items.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.infoRowLeft}>
            <Ionicons
              name={item.icon}
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
            numberOfLines={2}
          >
            {item.value || emptyLabel}
          </Text>
        </View>
      ))}
    </>
  );
}

function Field({
  theme,
  label,
  placeholder,
  value,
  onChangeText,
  secure,
  keyboardType,
  autoCapitalize,
}: {
  theme: ThemeColors;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
        {label}
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
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        secureTextEntry={secure}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function FormModal({
  visible,
  title,
  theme,
  loading,
  onClose,
  onSubmit,
  submitLabel,
  cancelLabel,
  children,
}: {
  visible: boolean;
  title: string;
  theme: ThemeColors;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>{children}</View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.modalCancelText, { color: theme.textMain }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalSubmitBtn,
                { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSpacer: { width: 38 },

  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrap: { marginBottom: 12 },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  codeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  codeChipText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  heroRole: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  heroOrg: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 18,
  },
  statsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 17, fontWeight: "800" },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },

  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionTile: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  actionHint: { fontSize: 11, fontWeight: "500" },

  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 12,
  },
  infoRowLeft: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: "500",
    paddingVertical: 10,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  expandText: { fontSize: 13, fontWeight: "700" },

  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  supportLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  supportLabel: { fontSize: 14, fontWeight: "600" },

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
  logoutBtnText: { fontSize: 14, fontWeight: "700" },
  versionText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
    textDecorationLine: "underline",
  },

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
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalBody: { gap: 16, marginBottom: 20 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "700" },
  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: { flexDirection: "row", gap: 12 },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
  modalSubmitBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubmitText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
