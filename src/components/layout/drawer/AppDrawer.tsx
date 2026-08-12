import { showAlert, showConfirm } from "@/components/ui/confirm";
import { getQuickAccessItems, QuickAccessItem } from "@/features/home/quickAccess";
import { useAttendance, useProfile } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { useDrawerStore } from "@/store/drawerStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

const { width } = Dimensions.get("window");

const ViFlag = ({
  width: w = 20,
  height = 14,
}: {
  width?: number;
  height?: number;
}) => (
  <Svg viewBox="0 0 28 20" width={w} height={height}>
    <Rect width="28" height="20" fill="#EA403F" />
    <Path
      d="M14 12.34L10.4733 14.8541L11.7745 10.7231L8.29366 8.1459L12.6246 8.1069L14 4L15.3754 8.1069L19.7063 8.1459L16.2255 10.7231L17.5267 14.8541L14 12.34Z"
      fill="#FFFE4E"
    />
  </Svg>
);

const EnFlag = ({
  width: w = 20,
  height = 14,
}: {
  width?: number;
  height?: number;
}) => (
  <Svg viewBox="0 0 28 20" width={w} height={height}>
    <Rect width="28" height="20" fill="#0A17A7" />
    <Path
      d="M-1.28244 -1.91644L10.6667 6.14335V-1.33333H17.3334V6.14335L29.2825 -1.91644L30.7737 0.294324L21.3263 6.66667H28V13.3333H21.3263L30.7737 19.7057L29.2825 21.9165L17.3334 13.8567V21.3333H10.6667V13.8567L-1.28244 21.9165L-2.77362 19.7057L6.67377 13.3333H0V6.66667H6.67377L-2.77362 0.294324L-1.28244 -1.91644Z"
      fill="white"
    />
    <Path
      d="M18.668 6.33219L31.3333 -2"
      stroke="#DB1F35"
      strokeWidth="0.666667"
      strokeLinecap="round"
    />
    <Path
      d="M20.0128 13.6975L31.3666 21.3503"
      stroke="#DB1F35"
      strokeWidth="0.666667"
      strokeLinecap="round"
    />
    <Path
      d="M8.00555 6.31046L-3.83746 -1.67099"
      stroke="#DB1F35"
      strokeWidth="0.666667"
      strokeLinecap="round"
    />
    <Path
      d="M9.29006 13.6049L-3.83746 22.3105"
      stroke="#DB1F35"
      strokeWidth="0.666667"
      strokeLinecap="round"
    />
    <Path d="M0 12H12V20H16V12H28V8H16V0H12V8H0V12Z" fill="#E6273E" />
  </Svg>
);

function renderQuickIcon(item: QuickAccessItem, size = 16) {
  if (item.iconType === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={item.icon as any}
        size={size}
        color={item.color}
      />
    );
  }
  return <Ionicons name={item.icon as any} size={size} color={item.color} />;
}

export function AppDrawer() {
  const isOpen = useDrawerStore((s) => s.isOpen);
  const close = useDrawerStore((s) => s.close);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage, t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const activeColorScheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const { profile } = useProfile();
  const { ensureLocationPermission } = useAttendance();

  const drawerAnim = useRef(new Animated.Value(width)).current;
  const [locationPerm, setLocationPerm] = useState(false);
  const [notifPerm, setNotifPerm] = useState(false);
  const [cameraPerm, setCameraPerm] = useState(false);

  const isDarkMode = activeColorScheme === "dark";
  const quickAccessItems = useMemo(() => getQuickAccessItems(t), [t]);

  const displayName =
    profile?.fullName ||
    (profile?.username
      ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
      : user?.username || t("common.employee"));

  const employeeCode =
    profile?.employeeCode ||
    (profile?.id ? profile.id.slice(0, 8).toUpperCase() : null);

  const positionLabel =
    profile?.positionName || profile?.position || t("common.employee");

  const refreshPermissions = useCallback(async () => {
    try {
      const current = await Location.getForegroundPermissionsAsync();
      setLocationPerm(current.status === Location.PermissionStatus.GRANTED);
    } catch {
      setLocationPerm(false);
    }
    try {
      const cam = await ImagePicker.getCameraPermissionsAsync();
      setCameraPerm(cam.granted);
    } catch {
      setCameraPerm(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    drawerAnim.setValue(width);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    void refreshPermissions();
  }, [isOpen, drawerAnim, refreshPermissions]);

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => close());
  };

  const handleLocationToggle = async (val: boolean) => {
    if (!val) {
      setLocationPerm(false);
      showAlert(
        t("permissions.locationTitle"),
        t("permissions.locationDisabled"),
        { variant: "warning" },
      );
      return;
    }
    try {
      const granted = await ensureLocationPermission();
      setLocationPerm(granted);
      if (!granted) {
        showAlert(
          t("permissions.locationMissing"),
          t("permissions.locationDenied"),
          { variant: "error" },
        );
      }
    } catch {
      setLocationPerm(false);
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      void Linking.openURL("app-settings:");
    } else {
      void Linking.openSettings();
    }
  };

  const handleNotifToggle = (val: boolean) => {
    if (!val) {
      setNotifPerm(false);
      return;
    }
    showConfirm({
      title: t("permissions.notifTitle"),
      message: t("permissions.notifBody"),
      variant: "confirm",
      dismissible: true,
      onDismiss: () => setNotifPerm(false),
      buttons: [
        {
          text: t("common.deny"),
          style: "cancel",
          onPress: () => setNotifPerm(false),
        },
        {
          text: t("common.allow"),
          style: "default",
          onPress: () => {
            setNotifPerm(true);
            openAppSettings();
          },
        },
      ],
    });
  };

  const handleCameraToggle = async (val: boolean) => {
    if (!val) {
      setCameraPerm(false);
      return;
    }
    try {
      const current = await ImagePicker.getCameraPermissionsAsync();
      if (current.granted) {
        setCameraPerm(true);
        return;
      }
      if (!current.canAskAgain) {
        showConfirm({
          title: t("permissions.cameraTitle"),
          message: t("permissions.cameraBody"),
          variant: "confirm",
          dismissible: true,
          onDismiss: () => setCameraPerm(false),
          buttons: [
            {
              text: t("common.deny"),
              style: "cancel",
              onPress: () => setCameraPerm(false),
            },
            {
              text: t("common.allow"),
              style: "default",
              onPress: () => {
                setCameraPerm(false);
                openAppSettings();
              },
            },
          ],
        });
        return;
      }
      const result = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPerm(result.granted);
      if (!result.granted) {
        showAlert(
          t("permissions.cameraTitle"),
          t("permissions.cameraBody"),
          { variant: "warning" },
        );
      }
    } catch {
      setCameraPerm(false);
    }
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };

  if (!isOpen) return null;

  return (
    <View style={styles.drawerRoot} pointerEvents="box-none">
      <View style={styles.drawerOverlay}>
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        />

        <Animated.View
          style={[
            styles.drawerContent,
            {
              backgroundColor: isDarkMode ? "#0D1117" : "#FFFFFF",
              borderLeftColor: isDarkMode ? "#1F2937" : "#E5E7EB",
              transform: [{ translateX: drawerAnim }],
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={isDarkMode ? "#F5F5F7" : "#1F2937"}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.drawerHeaderTitle,
                { color: isDarkMode ? "#F5F5F7" : "#1F2937" },
              ]}
            >
              Menu
            </Text>
            <View style={{ width: 22 }} />
          </View>

          <View
            style={[
              styles.drawerProfile,
              { backgroundColor: isDarkMode ? "#131929" : "#F0F4FF" },
            ]}
          >
            <View style={styles.drawerAvatar}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.drawerAvatarImage}
                />
              ) : (
                <Ionicons name="person" size={26} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.drawerProfileInfo}>
              <Text
                style={[
                  styles.drawerProfileName,
                  { color: isDarkMode ? "#F5F5F7" : "#1F2937" },
                ]}
              >
                {displayName}
              </Text>
              <Text
                style={[
                  styles.drawerProfileCode,
                  { color: isDarkMode ? "#6B7280" : "#9CA3AF" },
                ]}
              >
                ID: {employeeCode || "—"}
              </Text>
              <View style={styles.drawerRoleBadge}>
                <Text style={styles.drawerRoleText}>{positionLabel}</Text>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View
              style={[
                styles.drawerSection,
                { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
              ]}
            >
              <View style={styles.drawerSectionHeader}>
                <Ionicons name="settings-outline" size={16} color="#1A56DB" />
                <Text
                  style={[
                    styles.drawerSectionTitle,
                    { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  {t("home.drawerSystem")}
                </Text>
              </View>
              {[
                {
                  label: t("permissions.location"),
                  value: locationPerm,
                  onToggle: handleLocationToggle,
                  icon: "location-outline",
                  color: "#10B981",
                },
                {
                  label: t("permissions.notification"),
                  value: notifPerm,
                  onToggle: handleNotifToggle,
                  icon: "notifications-outline",
                  color: "#4F46E5",
                },
                {
                  label: t("permissions.camera"),
                  value: cameraPerm,
                  onToggle: handleCameraToggle,
                  icon: "camera-outline",
                  color: "#F59E0B",
                },
              ].map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.drawerRow,
                    { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
                  ]}
                >
                  <View style={styles.drawerRowLeft}>
                    <View
                      style={[
                        styles.drawerRowIcon,
                        { backgroundColor: item.color + "18" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={16}
                        color={item.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.drawerRowLabel,
                        { color: isDarkMode ? "#D1D5DB" : "#374151" },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    thumbColor={item.value ? item.color : "#9CA3AF"}
                    trackColor={{
                      false: isDarkMode ? "#374151" : "#E5E7EB",
                      true: item.color + "66",
                    }}
                  />
                </View>
              ))}
            </View>

            <View
              style={[
                styles.drawerSection,
                { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
              ]}
            >
              <View style={styles.drawerSectionHeader}>
                <Ionicons
                  name="color-palette-outline"
                  size={16}
                  color="#2563EB"
                />
                <Text
                  style={[
                    styles.drawerSectionTitle,
                    { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  {t("home.drawerAppSettings")}
                </Text>
              </View>

              <View
                style={[
                  styles.drawerRow,
                  { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
                ]}
              >
                <View style={styles.drawerRowLeft}>
                  <View
                    style={[
                      styles.drawerRowIcon,
                      { backgroundColor: "rgba(37,99,235,0.12)" },
                    ]}
                  >
                    <Ionicons name="moon-outline" size={16} color="#2563EB" />
                  </View>
                  <Text
                    style={[
                      styles.drawerRowLabel,
                      { color: isDarkMode ? "#D1D5DB" : "#374151" },
                    ]}
                  >
                    {t("home.darkMode")}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => setTheme(val ? "dark" : "light")}
                  thumbColor={isDarkMode ? "#2563EB" : "#9CA3AF"}
                  trackColor={{
                    false: isDarkMode ? "#374151" : "#E5E7EB",
                    true: "#2563EB66",
                  }}
                />
              </View>

              <View
                style={[
                  styles.drawerRow,
                  styles.drawerRowLast,
                  { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
                ]}
              >
                <View style={styles.drawerRowLeft}>
                  <View
                    style={[
                      styles.drawerRowIcon,
                      { backgroundColor: "rgba(6,182,212,0.12)" },
                    ]}
                  >
                    <Ionicons
                      name="language-outline"
                      size={16}
                      color="#06B6D4"
                    />
                  </View>
                  <Text
                    style={[
                      styles.drawerRowLabel,
                      { color: isDarkMode ? "#D1D5DB" : "#374151" },
                    ]}
                  >
                    {t("home.language")}
                  </Text>
                </View>
                <View style={styles.langGroup}>
                  {[
                    { code: "vi" as const, Flag: ViFlag, label: "VI" },
                    { code: "en" as const, Flag: EnFlag, label: "EN" },
                  ].map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langBtn,
                        {
                          borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                          backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
                        },
                        language === lang.code && {
                          backgroundColor: "#1A56DB",
                          borderColor: "#1A56DB",
                        },
                      ]}
                      onPress={() => setLanguage(lang.code)}
                    >
                      <lang.Flag width={16} height={11} />
                      <Text
                        style={[
                          styles.langBtnText,
                          {
                            color:
                              language === lang.code
                                ? "#FFF"
                                : isDarkMode
                                  ? "#9CA3AF"
                                  : "#6B7280",
                          },
                        ]}
                      >
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View
              style={[
                styles.drawerSection,
                { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
              ]}
            >
              <View style={styles.drawerSectionHeader}>
                <Ionicons name="apps-outline" size={16} color="#F59E0B" />
                <Text
                  style={[
                    styles.drawerSectionTitle,
                    { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  {t("home.drawerUtils")}
                </Text>
              </View>
              {quickAccessItems.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.drawerNavItem,
                    { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
                    i === quickAccessItems.length - 1 && styles.drawerRowLast,
                  ]}
                  onPress={() => {
                    closeDrawer();
                    if (item.route) router.push(item.route);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.drawerRowIcon,
                      { backgroundColor: item.bg },
                    ]}
                  >
                    {renderQuickIcon(item, 16)}
                  </View>
                  <Text
                    style={[
                      styles.drawerRowLabel,
                      { color: isDarkMode ? "#D1D5DB" : "#374151" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={isDarkMode ? "#4B5563" : "#D1D5DB"}
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.3)",
              },
            ]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>{t("home.logout")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerBackdrop: { flex: 1.2 },
  drawerContent: {
    flex: 2.8,
    height: "100%",
    borderLeftWidth: 1,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerHeaderTitle: { fontSize: 16, fontWeight: "700" },
  drawerProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#1A56DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A56DB",
    overflow: "hidden",
  },
  drawerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  drawerProfileInfo: { flex: 1 },
  drawerProfileName: { fontSize: 14, fontWeight: "700" },
  drawerProfileCode: { fontSize: 11, marginTop: 2 },
  drawerRoleBadge: {
    marginTop: 4,
    backgroundColor: "rgba(26,86,219,0.12)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  drawerRoleText: { fontSize: 10, fontWeight: "700", color: "#1A56DB" },
  drawerSection: { borderTopWidth: 1, paddingTop: 14, marginBottom: 4 },
  drawerSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  drawerSectionTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  drawerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  drawerRowLast: { borderBottomWidth: 0 },
  drawerRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  drawerRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerRowLabel: { fontSize: 13, fontWeight: "500" },
  drawerNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  langGroup: { flexDirection: "row", gap: 6 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  langBtnText: { fontSize: 11, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  logoutBtnText: { color: "#EF4444", fontSize: 14, fontWeight: "700" },
});
