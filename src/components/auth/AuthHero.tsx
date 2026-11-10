import { LanguageChange } from "@/components/common/LanguageChange";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export const AUTH_GRADIENT = ["#2563EB", "#1E40AF", "#172554"] as const;

interface AuthHeroProps {
  /** Large title shown in the hero. */
  title: string;
  subtitle?: string;
  /** Feather icon shown in the glass badge. */
  icon?: React.ComponentProps<typeof Feather>["name"];
  /** Shows the SMARTHRM brand line above the title. */
  showBrand?: boolean;
  brandTagline?: string;
  onBack?: () => void;
  /** Extra content rendered at the bottom of the hero (e.g. step indicator). */
  children?: React.ReactNode;
}

/**
 * Gradient header shared by the auth screens. The form sheet below it should
 * use a negative top margin equal to SHEET_OVERLAP so it tucks under the curve.
 */
export const SHEET_OVERLAP = 28;

export function AuthHero({
  title,
  subtitle,
  icon = "briefcase",
  showBrand,
  brandTagline,
  onBack,
  children,
}: AuthHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: SHEET_OVERLAP + 28,
        paddingHorizontal: 24,
        overflow: "hidden",
      }}
    >
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="authBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={AUTH_GRADIENT[0]} />
            <Stop offset="0.55" stopColor={AUTH_GRADIENT[1]} />
            <Stop offset="1" stopColor={AUTH_GRADIENT[2]} />
          </LinearGradient>
          <RadialGradient id="authGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#60A5FA" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#authBg)" />
        <Circle cx="88%" cy="8%" r="150" fill="url(#authGlow)" />
        <Circle
          cx="96%"
          cy="70%"
          r="90"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.08"
          strokeWidth="18"
        />
        <Circle cx="-4%" cy="92%" r="70" fill="#FFFFFF" fillOpacity="0.05" />
      </Svg>

      {/* Top bar */}
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View />
        )}
        <LanguageChange color="#FFFFFF" />
      </View>

      <View style={styles.badge}>
        <Feather name={icon} size={26} color="#FFFFFF" />
      </View>

      {showBrand ? (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.brand}>SMARTHRM</Text>
          {brandTagline ? (
            <Text style={styles.tagline}>{brandTagline}</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    minHeight: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    marginBottom: 20,
  },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
    color: "rgba(255,255,255,0.9)",
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: "rgba(255,255,255,0.78)",
    marginTop: 6,
  },
});
