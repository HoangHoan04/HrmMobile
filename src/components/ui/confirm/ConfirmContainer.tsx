import { Colors } from "@/constants/common/Colors";
import {
  CONFIRM_HIDE_EVENT,
  CONFIRM_SHOW_EVENT,
} from "@/helper/ConfirmEventEmitter";
import type {
  ConfirmButton,
  ConfirmOptions,
  ConfirmVariant,
} from "@/components/ui/confirm/types";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  DeviceEventEmitter,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function iconForVariant(variant: ConfirmVariant) {
  switch (variant) {
    case "success":
      return "checkmark-circle" as const;
    case "error":
      return "alert-circle" as const;
    case "warning":
      return "warning" as const;
    case "confirm":
      return "help-circle" as const;
    default:
      return "information-circle" as const;
  }
}

export function ConfirmContainer() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t } = useLanguageStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const optionsRef = useRef<ConfirmOptions | null>(null);
  optionsRef.current = options;

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOptions(null);
      setBusyIndex(null);
    });
  };

  const open = (next: ConfirmOptions) => {
    setBusyIndex(null);
    setOptions(next);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.92);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const showSub = DeviceEventEmitter.addListener(
      CONFIRM_SHOW_EVENT,
      (payload: ConfirmOptions) => open(payload),
    );
    const hideSub = DeviceEventEmitter.addListener(CONFIRM_HIDE_EVENT, () => {
      close();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const buttons: ConfirmButton[] = useMemo(() => {
    if (!options) return [];
    if (options.buttons?.length) return options.buttons;
    return [{ text: t("common.close") || "OK", style: "default" }];
  }, [options, t]);

  const variant = options?.variant ?? "info";
  const dismissible = options?.dismissible ?? true;

  const accent = (() => {
    switch (variant) {
      case "success":
        return theme.success;
      case "error":
        return theme.danger;
      case "warning":
        return theme.warning;
      case "confirm":
        return theme.primary;
      default:
        return theme.primary;
    }
  })();

  const handleButtonPress = async (button: ConfirmButton, index: number) => {
    if (busyIndex !== null) return;
    try {
      if (button.onPress) {
        const result = button.onPress();
        if (result && typeof (result as Promise<void>).then === "function") {
          setBusyIndex(index);
          await result;
        }
      }
    } finally {
      close();
    }
  };

  const handleBackdrop = () => {
    if (!dismissible || busyIndex !== null) return;
    optionsRef.current?.onDismiss?.();
    close();
  };

  if (!options) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleBackdrop}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdrop} />
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: accent + "18" }]}>
            <Ionicons name={iconForVariant(variant)} size={28} color={accent} />
          </View>

          <Text style={[styles.title, { color: theme.textMain }]}>
            {options.title}
          </Text>
          {!!options.message && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {options.message}
            </Text>
          )}

          <View
            style={[styles.actions, buttons.length > 2 && styles.actionsColumn]}
          >
            {buttons.map((button, index) => {
              const isCancel = button.style === "cancel";
              const isDestructive = button.style === "destructive";
              const isPrimary = !isCancel && !isDestructive;
              const busy = busyIndex === index;

              const bg = isDestructive
                ? theme.danger
                : isPrimary
                  ? theme.primary
                  : "transparent";
              const borderColor = isCancel ? theme.border : bg;
              const textColor = isCancel ? theme.textMain : "#FFFFFF";

              return (
                <TouchableOpacity
                  key={`${button.text}-${index}`}
                  activeOpacity={0.85}
                  disabled={busyIndex !== null}
                  onPress={() => void handleButtonPress(button, index)}
                  style={[
                    styles.btn,
                    buttons.length <= 2 && styles.btnRow,
                    buttons.length > 2 && styles.btnColumn,
                    {
                      backgroundColor: isCancel
                        ? colorScheme === "dark"
                          ? "#1F2937"
                          : "#F3F4F6"
                        : bg,
                      borderColor,
                      opacity: busyIndex !== null && !busy ? 0.55 : 1,
                    },
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color={textColor} />
                  ) : (
                    <Text style={[styles.btnText, { color: textColor }]}>
                      {button.text}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    alignItems: "center",
    zIndex: 2,
    elevation: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 18,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  actionsColumn: {
    flexDirection: "column",
  },
  btn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  btnRow: {
    flex: 1,
  },
  btnColumn: {
    width: "100%",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
