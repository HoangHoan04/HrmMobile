import { Colors } from "@/constants/common/Colors";
import { useDrawerStore } from "@/store/drawerStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type DrawerMenuButtonProps = {
  variant?: "onPrimary" | "surface";
  style?: StyleProp<ViewStyle>;
  size?: number;
};

export function DrawerMenuButton({
  variant = "surface",
  style,
  size = 22,
}: DrawerMenuButtonProps) {
  const open = useDrawerStore((s) => s.open);
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];

  const isOnPrimary = variant === "onPrimary";

  return (
    <TouchableOpacity
      style={[
        isOnPrimary ? styles.onPrimaryBtn : styles.surfaceBtn,
        !isOnPrimary && {
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        },
        style,
      ]}
      activeOpacity={0.8}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel="Menu"
    >
      <Ionicons
        name="menu-outline"
        size={size}
        color={isOnPrimary ? "#FFFFFF" : theme.textMain}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  onPrimaryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  surfaceBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
