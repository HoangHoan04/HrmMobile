import { Colors } from "@/constants/common/Colors";
import { getVietnameseDate } from "@/helper/helpers";
import { useAttendance, useProfile } from "@/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import
    {
        ActivityIndicator,
        Alert,
        Animated,
        Dimensions,
        Modal,
        ScrollView,
        StyleSheet,
        Switch,
        Text,
        TouchableOpacity,
        useColorScheme,
        View,
    } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

function formatClock(value?: string | null): string {
  if (!value) return "--:--";
  if (/^\d{1,2}:\d{2}/.test(value) && !value.includes("T")) {
    const [h, m] = value.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const { width } = Dimensions.get("window");

const ViFlag = ({
  width = 20,
  height = 14,
}: {
  width?: number;
  height?: number;
}) => (
  <Svg viewBox="0 0 28 20" width={width} height={height}>
    <Rect width="28" height="20" fill="#EA403F" />
    <Path
      d="M14 12.34L10.4733 14.8541L11.7745 10.7231L8.29366 8.1459L12.6246 8.1069L14 4L15.3754 8.1069L19.7063 8.1459L16.2255 10.7231L17.5267 14.8541L14 12.34Z"
      fill="#FFFE4E"
    />
  </Svg>
);

const EnFlag = ({
  width = 20,
  height = 14,
}: {
  width?: number;
  height?: number;
}) => (
  <Svg viewBox="0 0 28 20" width={width} height={height}>
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

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";

  const [activeColorScheme, setActiveColorScheme] = useState<"light" | "dark">(
    colorScheme,
  );
  const theme = Colors[activeColorScheme];
  const { profile } = useProfile();
  const {
    today,
    loadingToday,
    punching,
    error: attendanceError,
    fetchToday,
    checkIn,
    checkOut,
  } = useAttendance();

  const checkInTime = formatClock(today?.checkInAt);
  const checkOutTime = formatClock(today?.checkOutAt);
  const shiftLabel = useMemo(() => {
    const start = formatClock(today?.expectedStart);
    const end = formatClock(today?.expectedEnd);
    if (start === "--:--" && end === "--:--") return "--:-- - --:--";
    return `${start} - ${end}`;
  }, [today?.expectedStart, today?.expectedEnd]);
  const canCheckIn = !!today?.canCheckIn;
  const canCheckOut = !!today?.canCheckOut;
  const showCheckOutAction =
    canCheckOut || (!canCheckIn && !!today?.checkInAt && !today?.checkOutAt);

  useFocusEffect(
    useCallback(() => {
      fetchToday().catch(() => undefined);
    }, [fetchToday]),
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(width)).current;

  const [locationPerm, setLocationPerm] = useState(true);
  const [notifPerm, setNotifPerm] = useState(true);
  const [cameraPerm, setCameraPerm] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const handleLocationToggle = (val: boolean) => {
    if (val) {
      Alert.alert(
        "Quyền truy cập vị trí",
        "Cho phép HRM Mobile truy cập vị trí của thiết bị để phục vụ chức năng chấm công GPS?",
        [
          {
            text: "Từ chối",
            onPress: () => setLocationPerm(false),
            style: "cancel",
          },
          { text: "Đồng ý", onPress: () => setLocationPerm(true) },
        ],
      );
    } else {
      setLocationPerm(false);
    }
  };

  const handleNotifToggle = (val: boolean) => {
    if (val) {
      Alert.alert(
        "Quyền gửi thông báo",
        "Cho phép HRM Mobile gửi thông báo nhắc nhở chấm công, nhận lương, tin tức mới?",
        [
          {
            text: "Từ chối",
            onPress: () => setNotifPerm(false),
            style: "cancel",
          },
          { text: "Đồng ý", onPress: () => setNotifPerm(true) },
        ],
      );
    } else {
      setNotifPerm(false);
    }
  };

  const handleCameraToggle = (val: boolean) => {
    if (val) {
      Alert.alert(
        "Quyền truy cập Camera",
        "Cho phép HRM Mobile sử dụng camera của thiết bị để quét mã QR và xác thực khuôn mặt?",
        [
          {
            text: "Từ chối",
            onPress: () => setCameraPerm(false),
            style: "cancel",
          },
          { text: "Đồng ý", onPress: () => setCameraPerm(true) },
        ],
      );
    } else {
      setCameraPerm(false);
    }
  };

  const handleDarkModeToggle = (val: boolean) => {
    setIsDarkMode(val);
    setActiveColorScheme(val ? "dark" : "light");
  };

  const openDrawer = () => {
    setIsMenuOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsMenuOpen(false));
  };

  const handleAttendancePress = async () => {
    if (punching || loadingToday) return;
    if (today?.onLeave) {
      Alert.alert(
        "Nghỉ phép",
        "Bạn đang trong ngày nghỉ phép đã duyệt, không thể chấm công.",
      );
      return;
    }
    try {
      if (canCheckOut || showCheckOutAction) {
        await checkOut();
      } else if (canCheckIn) {
        await checkIn();
      } else {
        Alert.alert(
          "Thông báo",
          "Bạn đã hoàn tất chấm công hôm nay hoặc chưa thể chấm công.",
        );
      }
    } catch {}
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };

  const quickAccessItems = [
    {
      id: "tangca",
      label: "Tăng ca",
      icon: "alarm-outline",
      iconType: "Ionicons" as const,
    },
    {
      id: "nghiphep",
      label: "Nghỉ phép",
      icon: "calendar-check-outline",
      iconType: "MaterialCommunityIcons" as const,
    },
    {
      id: "onsite",
      label: "Onsite",
      icon: "map-pin",
      iconType: "Feather" as const,
    },
    {
      id: "bangcong",
      label: "Bảng công",
      icon: "clipboard-outline",
      iconType: "Ionicons" as const,
    },
    {
      id: "bangluong",
      label: "Bảng lương",
      icon: "wallet-outline",
      iconType: "Ionicons" as const,
    },
    {
      id: "phonghop",
      label: "Phòng họp",
      icon: "door-open",
      iconType: "MaterialCommunityIcons" as const,
    },
  ];

  const renderIcon = (
    item: (typeof quickAccessItems)[0],
    size = 26,
    color?: string,
  ) => {
    const iconColor = color || theme.primary;
    if (item.iconType === "Ionicons") {
      return <Ionicons name={item.icon as any} size={size} color={iconColor} />;
    } else if (item.iconType === "Feather") {
      return <Feather name={item.icon as any} size={size} color={iconColor} />;
    } else {
      return (
        <MaterialCommunityIcons
          name={item.icon as any}
          size={size}
          color={iconColor}
        />
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: activeColorScheme === "dark" ? "#000000" : "#F4F7FA",
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatarContainer}
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <View style={[styles.avatar, { borderColor: theme.primary }]}>
                <Ionicons name="person" size={26} color="#FFFFFF" />
              </View>
              <View style={styles.statusDot} />
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              <Text
                style={[styles.greetingText, { color: theme.textSecondary }]}
              >
                Xin chào,
              </Text>
              <Text style={[styles.userNameText, { color: theme.textMain }]}>
                {profile?.username
                  ? profile.username.charAt(0).toUpperCase() +
                    profile.username.slice(1)
                  : user?.username || "Hoàng Đình Hoàn"}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.textMain}
              />
              <View style={styles.badgeDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  marginLeft: 8,
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={openDrawer}
            >
              <Ionicons name="menu-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeDateRow}>
          <Text style={[styles.welcomeMessage, { color: theme.textMain }]}>
            Chúc bạn một ngày làm việc hiệu quả! 🎉
          </Text>
          <Text style={[styles.dateText, { color: theme.primary }]}>
            {getVietnameseDate()}
          </Text>
        </View>

        <View
          style={[
            styles.mainCard,
            { backgroundColor: theme.cardBg, borderColor: theme.primary },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              TRẠNG THÁI CHẤM CÔNG
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeftLabel}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.textSecondary}
                  style={styles.infoIcon}
                />
                <Text
                  style={[styles.infoLabel, { color: theme.textSecondary }]}
                >
                  Ca làm việc
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.textMain }]}>
                {shiftLabel}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeftLabel}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={
                    checkInTime === "--:--" ? theme.textSecondary : "#10B981"
                  }
                  style={styles.infoIcon}
                />
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color:
                        checkInTime === "--:--"
                          ? theme.textSecondary
                          : theme.textMain,
                      fontWeight: "600",
                    },
                  ]}
                >
                  Vào ca
                </Text>
              </View>
              <Text
                style={[
                  styles.infoValue,
                  checkInTime === "--:--"
                    ? styles.grayText
                    : { color: "#10B981", fontWeight: "700" },
                ]}
              >
                {checkInTime}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeftLabel}>
                <Ionicons
                  name={
                    checkOutTime === "--:--"
                      ? "ellipse-outline"
                      : "checkmark-circle"
                  }
                  size={16}
                  color={
                    checkOutTime === "--:--" ? theme.textSecondary : "#EF4444"
                  }
                  style={styles.infoIcon}
                />
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color:
                        checkOutTime === "--:--"
                          ? theme.textSecondary
                          : theme.textMain,
                    },
                  ]}
                >
                  Ra ca
                </Text>
              </View>
              <Text
                style={[
                  styles.infoValue,
                  checkOutTime === "--:--"
                    ? styles.grayText
                    : { color: "#EF4444", fontWeight: "700" },
                ]}
              >
                {checkOutTime}
              </Text>
            </View>

            {(today?.status || today?.onLeave || today?.branchName) && (
              <>
                <View
                  style={[styles.divider, { backgroundColor: theme.border }]}
                />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeftLabel}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color={theme.textSecondary}
                      style={styles.infoIcon}
                    />
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Trạng thái
                    </Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.textMain }]}>
                    {today?.onLeave ? "Nghỉ phép" : today?.status || "—"}
                  </Text>
                </View>
              </>
            )}

            {attendanceError && !loadingToday && (
              <Text style={styles.attendanceErrorText}>{attendanceError}</Text>
            )}
          </View>

          <View style={styles.actionBtnContainer}>
            {loadingToday && !today ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.circularActionBtn,
                  showCheckOutAction
                    ? styles.checkOutBtn
                    : {
                        backgroundColor: theme.primary,
                        shadowColor: theme.primary,
                      },
                  (!canCheckIn && !canCheckOut && !showCheckOutAction) ||
                  punching
                    ? { opacity: 0.55 }
                    : null,
                ]}
                onPress={handleAttendancePress}
                activeOpacity={0.85}
                disabled={
                  punching ||
                  loadingToday ||
                  (!canCheckIn && !canCheckOut && !showCheckOutAction)
                }
              >
                <View style={styles.circularActionBtnInner}>
                  {punching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name={
                        showCheckOutAction
                          ? "finger-print-outline"
                          : "finger-print"
                      }
                      size={36}
                      color="#FFFFFF"
                    />
                  )}
                  <Text style={styles.circularActionBtnText}>
                    {punching
                      ? "..."
                      : showCheckOutAction
                        ? "RA CA"
                        : canCheckIn
                          ? "VÀO CA"
                          : "XONG"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={[
            styles.cardSecondary,
            {
              marginTop: 24,
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="grid-outline"
              size={16}
              color={theme.textSecondary}
            />
            <Text
              style={[
                styles.cardTitleSecondary,
                { color: theme.textSecondary },
              ]}
            >
              TRUY CẬP NHANH
            </Text>
          </View>

          <View style={styles.gridContainer}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.gridIconWrap,
                    {
                      backgroundColor:
                        activeColorScheme === "dark"
                          ? "rgba(59, 130, 246, 0.12)"
                          : "rgba(59, 130, 246, 0.08)",
                    },
                  ]}
                >
                  {renderIcon(item)}
                </View>
                <Text style={[styles.gridLabel, { color: theme.textMain }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="none"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={closeDrawer}
      >
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
                backgroundColor: theme.cardBg,
                borderLeftColor: theme.border,
                transform: [{ translateX: drawerAnim }],
                paddingTop: Math.max(insets.top, 20),
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
              <Text
                style={[styles.drawerHeaderTitle, { color: theme.textMain }]}
              >
                Menu
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={[styles.drawerProfile, { borderColor: theme.border }]}>
              <View
                style={[
                  styles.drawerAvatar,
                  { backgroundColor: "#5B6B73", borderColor: theme.primary },
                ]}
              >
                <Ionicons name="person" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.drawerProfileInfo}>
                <Text
                  style={[styles.drawerProfileName, { color: theme.textMain }]}
                >
                  {profile?.username
                    ? profile.username.charAt(0).toUpperCase() +
                      profile.username.slice(1)
                    : user?.username || "Hoàng Đình Hoàn"}
                </Text>
                <Text
                  style={[
                    styles.drawerProfileCode,
                    { color: theme.textSecondary },
                  ]}
                >
                  Code: {profile?.id?.slice(0, 8).toUpperCase() || "EMP-2026"}
                </Text>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <View
                style={[styles.accordionItem, { borderColor: theme.border }]}
              >
                <View style={styles.accordionHeader}>
                  <View style={styles.accordionTitleRow}>
                    <Ionicons
                      name="construct-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.accordionTitle, { color: theme.textMain }]}
                    >
                      Hệ thống
                    </Text>
                  </View>
                </View>

                <View style={styles.accordionBody}>
                  <View style={styles.settingRow}>
                    <Text
                      style={[styles.settingLabel, { color: theme.textMain }]}
                    >
                      Quyền vị trí
                    </Text>
                    <View
                      style={[
                        styles.switchWrapper,
                        { borderColor: theme.border },
                      ]}
                    >
                      <Switch
                        value={locationPerm}
                        onValueChange={handleLocationToggle}
                        thumbColor={locationPerm ? theme.primary : "#9CA3AF"}
                        trackColor={{ false: "#FFFFFF", true: "#FFFFFF" }}
                        ios_backgroundColor="#FFFFFF"
                      />
                    </View>
                  </View>
                  <View style={styles.settingRow}>
                    <Text
                      style={[styles.settingLabel, { color: theme.textMain }]}
                    >
                      Quyền thông báo
                    </Text>
                    <View
                      style={[
                        styles.switchWrapper,
                        { borderColor: theme.border },
                      ]}
                    >
                      <Switch
                        value={notifPerm}
                        onValueChange={handleNotifToggle}
                        thumbColor={notifPerm ? theme.primary : "#9CA3AF"}
                        trackColor={{ false: "#FFFFFF", true: "#FFFFFF" }}
                        ios_backgroundColor="#FFFFFF"
                      />
                    </View>
                  </View>
                  <View style={styles.settingRow}>
                    <Text
                      style={[styles.settingLabel, { color: theme.textMain }]}
                    >
                      Quyền camera
                    </Text>
                    <View
                      style={[
                        styles.switchWrapper,
                        { borderColor: theme.border },
                      ]}
                    >
                      <Switch
                        value={cameraPerm}
                        onValueChange={handleCameraToggle}
                        thumbColor={cameraPerm ? theme.primary : "#9CA3AF"}
                        trackColor={{ false: "#FFFFFF", true: "#FFFFFF" }}
                        ios_backgroundColor="#FFFFFF"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={[styles.accordionItem, { borderColor: theme.border }]}
              >
                <View style={styles.accordionHeader}>
                  <View style={styles.accordionTitleRow}>
                    <Ionicons
                      name="apps-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.accordionTitle, { color: theme.textMain }]}
                    >
                      Tiện ích nhân sự
                    </Text>
                  </View>
                </View>

                <View style={styles.accordionBody}>
                  <View style={styles.utilGrid}>
                    {quickAccessItems.map((util) => (
                      <TouchableOpacity
                        key={util.id}
                        style={styles.utilItem}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.utilIconContainer,
                            {
                              backgroundColor:
                                activeColorScheme === "dark"
                                  ? "rgba(59, 130, 246, 0.12)"
                                  : "rgba(59, 130, 246, 0.08)",
                            },
                          ]}
                        >
                          {renderIcon(util, 18)}
                        </View>
                        <Text
                          style={[styles.utilLabel, { color: theme.textMain }]}
                          numberOfLines={1}
                        >
                          {util.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View
                style={[styles.accordionItem, { borderColor: theme.border }]}
              >
                <View style={styles.accordionHeader}>
                  <View style={styles.accordionTitleRow}>
                    <Ionicons
                      name="options-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.accordionTitle, { color: theme.textMain }]}
                    >
                      Cài đặt App
                    </Text>
                  </View>
                </View>

                <View style={styles.accordionBody}>
                  <View style={styles.settingRow}>
                    <Text
                      style={[styles.settingLabel, { color: theme.textMain }]}
                    >
                      Dark Mode
                    </Text>
                    <View
                      style={[
                        styles.switchWrapper,
                        { borderColor: theme.border },
                      ]}
                    >
                      <Switch
                        value={isDarkMode}
                        onValueChange={handleDarkModeToggle}
                        thumbColor={isDarkMode ? theme.primary : "#9CA3AF"}
                        trackColor={{ false: "#FFFFFF", true: "#FFFFFF" }}
                        ios_backgroundColor="#FFFFFF"
                      />
                    </View>
                  </View>
                  <View style={styles.langSettingRow}>
                    <Text
                      style={[styles.settingLabel, { color: theme.textMain }]}
                    >
                      Ngôn ngữ
                    </Text>
                    <View style={styles.langBtnGroup}>
                      <TouchableOpacity
                        style={[
                          styles.langBtn,
                          language === "vi" && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => setLanguage("vi")}
                      >
                        <View style={styles.langBtnInner}>
                          <ViFlag width={18} height={13} />
                          <Text
                            style={[
                              styles.langBtnText,
                              language === "vi"
                                ? { color: "#FFFFFF" }
                                : { color: theme.textMain },
                            ]}
                          >
                            VI
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.langBtn,
                          language === "en" && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => setLanguage("en")}
                      >
                        <View style={styles.langBtnInner}>
                          <EnFlag width={18} height={13} />
                          <Text
                            style={[
                              styles.langBtnText,
                              language === "en"
                                ? { color: "#FFFFFF" }
                                : { color: theme.textMain },
                            ]}
                          >
                            EN
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.logoutBtn, { borderColor: "#EF4444" }]}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Đăng xuất</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5B6B73",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3FCB6E",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  nameContainer: {
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  welcomeDateRow: {
    marginBottom: 24,
  },
  welcomeMessage: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  mainCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardSecondary: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardTitleSecondary: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLeftLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  grayText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  attendanceErrorText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "500",
    color: "#EF4444",
    textAlign: "center",
  },
  divider: {
    height: 1,
  },
  actionBtnContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  circularActionBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  circularActionBtnInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  checkOutBtn: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
  },
  circularActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 20,
    columnGap: 0,
    marginHorizontal: -8,
  },
  gridItem: {
    width: "33.33%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  gridIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawerBackdrop: {
    flex: 1.2,
  },
  drawerContent: {
    flex: 2.8,
    height: "100%",
    borderLeftWidth: 1,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
  drawerHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  drawerProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerProfileName: {
    fontSize: 15,
    fontWeight: "700",
  },
  drawerProfileCode: {
    fontSize: 11,
    marginTop: 2,
  },
  accordionItem: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accordionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  accordionBody: {
    paddingTop: 12,
    gap: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  langSettingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  langBtnGroup: {
    flexDirection: "row",
    gap: 6,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  langBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  utilGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 0,
  },
  utilItem: {
    width: "33.33%",
    alignItems: "center",
    marginVertical: 4,
  },
  utilIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  utilLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  switchWrapper: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
