import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const BLUE = {
  primary: "#3B82F6",
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",
  gradientTop: "#3B82F6",
  gradientBottom: "#1D4ED8",
  bg: "#FFFFFF",
  cardBg: "#F8FAFC",
  border: "#E5E7EB",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
};

type SlideKey = "meeting" | "stress" | "achievement" | "final";

interface SlideData {
  key: SlideKey;
  title: { vi: string; en: string };
  desc: { vi: string; en: string };
}

const SLIDES: SlideData[] = [
  {
    key: "meeting",
    title: { vi: "Chào mừng đến với Workmate!", en: "Welcome to Workmate!" },
    desc: {
      vi: "Đưa ra quyết định thông minh! Lên lịch rõ ràng cho dự án và ăn mừng thành tích của bạn.",
      en: "Make Smart Decisions! Set clear timelines for projects and celebrate your achievements!",
    },
  },
  {
    key: "stress",
    title: { vi: "Quản lý áp lực hiệu quả", en: "Manage Stress Effectively" },
    desc: {
      vi: "Giữ cân bằng! Theo dõi khối lượng công việc và duy trì mức độ căng thẳng hợp lý.",
      en: "Stay Balanced! Track your workload and maintain a healthy stress level with ease.",
    },
  },
  {
    key: "achievement",
    title: { vi: "Lên kế hoạch cho thành công", en: "Plan for Success" },
    desc: {
      vi: "Hành trình của bạn bắt đầu từ đây! Nhận huy hiệu thành tích khi hoàn thành nhiệm vụ.",
      en: "Your Journey Starts Here! Earn achievement badges as you conquer your tasks. Let's get started!",
    },
  },
  {
    key: "final",
    title: {
      vi: "Định hướng công việc hiệu quả & dễ dàng",
      en: "Navigate Your Work Journey Efficient & Easy",
    },
    desc: {
      vi: "Nâng cao hiệu quả quản lý công việc và phát triển sự nghiệp một cách vượt trội.",
      en: "Increase your work management & career development radically.",
    },
  },
];

export default function OnboardingScreen() {
  const { language } = useLanguageStore();
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);
  const isVi = language === "vi";
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const isLast = index === SLIDES.length - 1;

  const goToIndex = (i: number) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setIndex(i);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const handleNext = () => {
    if (isLast) {
      setOnboardingCompleted(true);
    } else {
      goToIndex(index + 1);
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted(true);
  };

  const handleSignIn = async () => {
    await setOnboardingCompleted(true);
    router.push("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BLUE.bg }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width, height: "100%" }}>
            <View style={styles.illustrationWrap}>
              <View
                style={[
                  styles.blobBack,
                  { backgroundColor: BLUE.primaryLight, opacity: 0.25 },
                ]}
              />
              <View
                style={[
                  styles.blobMid,
                  { backgroundColor: BLUE.gradientTop, opacity: 0.55 },
                ]}
              />
              <View
                style={[
                  styles.blobFront,
                  { backgroundColor: BLUE.gradientBottom },
                ]}
              />

              <MockupIllustration variant={item.key} isVi={isVi} />
            </View>

            <View
              style={[
                styles.contentWrap,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.title}>
                  {isVi ? item.title.vi : item.title.en}
                </Text>
                <Text style={styles.desc}>
                  {isVi ? item.desc.vi : item.desc.en}
                </Text>
              </View>

              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.dotsRow}>
                  {SLIDES.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          width: i === index ? 22 : 8,
                          backgroundColor:
                            i === index ? BLUE.primaryDark : BLUE.border,
                        },
                      ]}
                    />
                  ))}
                </View>

                {!isLast ? (
                  <>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleNext}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryBtnText}>
                        {isVi ? "Tiếp tục" : "Next"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.outlineBtn}
                      onPress={handleSkip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.outlineBtnText}>
                        {isVi ? "Bỏ qua" : "Skip"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleSignIn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryBtnText}>
                        {isVi ? "Đăng nhập" : "Sign In"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function MockupIllustration({
  variant,
  isVi,
}: {
  variant: SlideKey;
  isVi: boolean;
}) {
  return (
    <View style={styles.cardStack}>
      <View style={[styles.floatCard, styles.floatCardBack]} />
      <View style={[styles.floatCard, styles.floatCardMain]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>
            {variant === "meeting" &&
              (isVi ? "Cuộc họp hôm nay" : "Today Meeting")}
            {variant === "stress" &&
              (isVi ? "Chu kỳ làm việc" : "Working Period")}
            {variant === "achievement" && (isVi ? "Thành tích" : "Achievement")}
            {variant === "final" && (isVi ? "Nhiệm vụ hôm nay" : "Today Task")}
          </Text>
          <View style={styles.cardHeaderBadge}>
            <Text style={styles.cardHeaderBadgeText}>2</Text>
          </View>
        </View>
        <Text style={styles.cardHeaderSub}>
          {isVi ? "Lịch trình của bạn trong ngày" : "Your schedule for the day"}
        </Text>

        <View style={styles.cardListItem}>
          <View style={styles.cardListIcon}>
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.cardListText} numberOfLines={1}>
            {isVi ? "Họp toàn công ty" : "Townhall Meeting"}
          </Text>
          <View style={styles.cardListTimeBadge}>
            <Text style={styles.cardListTimeText}>08:30</Text>
          </View>
        </View>
      </View>
      <View style={[styles.floatCard, styles.floatCardSmall]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitleSm}>
            {isVi ? "Nhiệm vụ" : "Today Task"}
          </Text>
          <View style={styles.cardHeaderBadge}>
            <Text style={styles.cardHeaderBadgeText}>1</Text>
          </View>
        </View>
        <View style={styles.progressPillRow}>
          <View style={styles.progressPillDot} />
          <Text style={styles.progressPillText}>
            {isVi ? "Đang tiến hành" : "In Progress"}
          </Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityBadgeText}>
              {isVi ? "Cao" : "High"}
            </Text>
          </View>
        </View>
        <View style={styles.avatarRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.avatarDot, { marginLeft: i === 0 ? 0 : -8 }]}
            />
          ))}
          <Text style={styles.avatarMore}>+3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    height: height * 0.4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: BLUE.bg,
  },
  blobBack: {
    position: "absolute",
    top: -60,
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: width,
  },
  blobMid: {
    position: "absolute",
    top: -20,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width,
  },
  blobFront: {
    position: "absolute",
    top: 30,
    width: width * 1.05,
    height: width * 1.05,
    borderRadius: width,
  },

  cardStack: {
    width: width * 0.72,
    height: "72%",
    alignItems: "center",
    justifyContent: "center",
  },
  floatCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    padding: 14,
  },
  floatCardBack: {
    width: "88%",
    height: "60%",
    top: "18%",
    backgroundColor: "rgba(255,255,255,0.55)",
    transform: [{ rotate: "-6deg" }],
  },
  floatCardMain: {
    width: "100%",
    top: 0,
  },
  floatCardSmall: {
    width: "80%",
    bottom: 0,
    right: -10,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderTitle: { fontSize: 13, fontWeight: "800", color: BLUE.textMain },
  cardHeaderTitleSm: { fontSize: 12, fontWeight: "800", color: BLUE.textMain },
  cardHeaderSub: {
    fontSize: 10,
    color: BLUE.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  cardHeaderBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BLUE.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  cardHeaderBadgeText: { fontSize: 10, color: "#FFFFFF", fontWeight: "700" },

  cardListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: BLUE.cardBg,
    borderRadius: 10,
    padding: 8,
  },
  cardListIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: BLUE.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cardListText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: BLUE.textMain,
  },
  cardListTimeBadge: {
    backgroundColor: BLUE.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardListTimeText: { fontSize: 9, color: "#FFFFFF", fontWeight: "700" },

  progressPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  progressPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLUE.primaryDark,
  },
  progressPillText: {
    fontSize: 10,
    color: BLUE.textSecondary,
    fontWeight: "600",
  },
  priorityBadge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  priorityBadgeText: { fontSize: 9, color: "#DC2626", fontWeight: "700" },

  avatarRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  avatarDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE.primaryLight,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarMore: {
    fontSize: 10,
    color: BLUE.textSecondary,
    marginLeft: 6,
    fontWeight: "600",
  },

  contentWrap: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: BLUE.textMain,
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: BLUE.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: BLUE.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  outlineBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: BLUE.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: { fontSize: 15, fontWeight: "700", color: BLUE.primaryDark },
});
