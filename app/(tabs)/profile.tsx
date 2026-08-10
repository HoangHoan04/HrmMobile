import { ImageUploadButton } from "@/components/ui/upload/ImageUploadButton";
import { Colors } from "@/constants/common/Colors";
import { useThemeStore } from "@/store/themeStore";

import { useProfile } from "@/hooks";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useAuthStore } from "@/store/authStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AVATAR_URL_KEY = "USER_AVATAR_URL";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];

  const { profile, loading, refetch } = useProfile();
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
    SecureStore.getItemAsync(AVATAR_URL_KEY)
      .then((value) => {
        if (value) {
          setAvatarUrl(value);
        }
      })
      .catch(() => undefined);
  }, []);

  const handleAvatarUploaded = useCallback(async (url: string) => {
    setAvatarUrl(url);
    await SecureStore.setItemAsync(AVATAR_URL_KEY, url);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
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
      Alert.alert(
        "Trợ giúp",
        "Vui lòng liên hệ Phòng Nhân sự (HR) qua số 1900-HRM hoặc gửi email tới support@hrm.com để được hỗ trợ.",
      );
    } else if (id === "about") {
      Alert.alert(
        "Về ứng dụng",
        "HRM Mobile v1.0.0\nHệ thống quản trị nhân sự nội bộ chuyên nghiệp.",
      );
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    setModalLoading(true);
    try {
      await rootApi.post(endpoints.auth.changePassword, {
        oldPassword,
        newPassword,
      });
      Alert.alert("Thành công", "Thay đổi mật khẩu thành công.");
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Không thể đổi mật khẩu.";
      Alert.alert(
        "Lỗi",
        typeof errorMsg === "string" ? errorMsg : "Không thể đổi mật khẩu.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Email không được để trống.");
      return;
    }
    setModalLoading(true);
    try {
      await rootApi.post(endpoints.auth.updateProfile, {
        email,
        phoneNumber: phone,
      });
      Alert.alert("Thành công", "Cập nhật thông tin tài khoản thành công.");
      setIsSettingsModalOpen(false);
      await refetch();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Không thể cập nhật tài khoản.";
      Alert.alert(
        "Lỗi",
        typeof errorMsg === "string"
          ? errorMsg
          : "Không thể cập nhật tài khoản.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const displayName =
    profile?.fullName ||
    (user?.username
      ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
      : "Nhân viên");

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
          Đang tải hồ sơ...
        </Text>
      </View>
    );
  }

  const personalInfo = [
    { icon: "call-outline", label: "Số điện thoại", value: profile?.phone },
    {
      icon: "mail-outline",
      label: "Email",
      value: profile?.email || user?.email,
    },
    {
      icon: "calendar-outline",
      label: "Ngày sinh",
      value: profile?.dateOfBirth,
    },
    { icon: "location-outline", label: "Địa chỉ", value: profile?.address },
  ];

  const workInfo = [
    {
      icon: "business-outline",
      label: "Phòng ban",
      value: profile?.department,
    },
    { icon: "briefcase-outline", label: "Chức vụ", value: profile?.position },
    {
      icon: "calendar-clear-outline",
      label: "Ngày vào làm",
      value: profile?.joinDate,
    },
    {
      icon: "card-outline",
      label: "Mã nhân viên",
      value: profile?.employeeCode,
    },
  ];

  const menuActions = [
    { id: "password", icon: "lock-closed-outline", label: "Đổi mật khẩu" },
    { id: "settings", icon: "settings-outline", label: "Cài đặt tài khoản" },
    { id: "help", icon: "help-circle-outline", label: "Trợ giúp & Hỗ trợ" },
    { id: "about", icon: "information-circle-outline", label: "Về ứng dụng" },
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            Hồ sơ cá nhân
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

          {!!profile?.position && (
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
                {profile.position}
              </Text>
            </View>
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
                Công tháng này
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
                Phép còn lại
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textMain }]}>
                {profile?.stats?.yearsOfService ?? "--"}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Năm công tác
              </Text>
            </View>
          </View>
        </View>

        <InfoSection
          title="THÔNG TIN CÁ NHÂN"
          items={personalInfo}
          theme={theme}
          colorScheme={colorScheme}
        />

        <InfoSection
          title="THÔNG TIN CÔNG VIỆC"
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
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Phiên bản 1.0.0
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
                Đổi mật khẩu
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
                  Mật khẩu cũ
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
                  placeholder="Nhập mật khẩu cũ"
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
                  Mật khẩu mới
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
                  placeholder="Nhập mật khẩu mới"
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
                  Xác nhận mật khẩu mới
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
                  placeholder="Xác nhận mật khẩu mới"
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
                  Hủy
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
                  <Text style={styles.modalSubmitText}>Lưu</Text>
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
                Cài đặt tài khoản
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
                  Email
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
                  placeholder="Nhập email"
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
                  Số điện thoại
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
                  placeholder="Nhập số điện thoại"
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
                  Hủy
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
                  <Text style={styles.modalSubmitText}>Cập nhật</Text>
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
            {item.value || "Chưa cập nhật"}
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
