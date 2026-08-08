import { Colors } from "@/constants/common/Colors";
import { getStatusBarHeight } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  DeviceEventEmitter,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface ToastData {
  title?: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export const ToastContainer = () => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef<any>(null);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  const showToast = (data: ToastData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(data);

    fadeAnim.setValue(0);
    slideAnim.setValue(-50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 20,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  };

  useEffect(() => {
    const subToast = DeviceEventEmitter.addListener("showToast", (msg) => {
      showToast({ message: msg, type: "info" });
    });
    const subError = DeviceEventEmitter.addListener("showToastError", (msg) => {
      showToast({ title: "Thất bại", message: msg, type: "error" });
    });
    const subSuccess = DeviceEventEmitter.addListener(
      "showToastSuccess",
      (msg) => {
        showToast({ title: "Thành công", message: msg, type: "success" });
      },
    );
    const subInfo = DeviceEventEmitter.addListener("showToastInfo", (msg) => {
      showToast({ title: "Thông tin", message: msg, type: "info" });
    });
    const subCustom = DeviceEventEmitter.addListener(
      "showToastCustom",
      (data) => {
        const typeMap: Record<
          string,
          "success" | "error" | "warning" | "info"
        > = {
          SUCCESS: "success",
          ERROR: "error",
          WARN: "warning",
          INFO: "info",
        };
        showToast({
          title: data.title,
          message: data.message,
          type: typeMap[data.type] || "info",
        });
      },
    );

    return () => {
      subToast.remove();
      subError.remove();
      subSuccess.remove();
      subInfo.remove();
      subCustom.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return (
          <Ionicons name="checkmark-circle" size={24} color={theme.success} />
        );
      case "error":
        return <Ionicons name="alert-circle" size={24} color={theme.danger} />;
      case "warning":
        return <Ionicons name="warning" size={24} color={theme.warning} />;
      default:
        return (
          <Ionicons name="information-circle" size={24} color={theme.primary} />
        );
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return theme.success;
      case "error":
        return theme.danger;
      case "warning":
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          backgroundColor: theme.cardBg,
          borderColor: getBorderColor(),
          shadowColor: "#000",
          shadowOpacity: colorScheme === "light" ? 0.08 : 0.25,
        },
      ]}
    >
      <Pressable onPress={hideToast} style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          {toast.title && (
            <Text style={[styles.title, { color: theme.textMain }]}>
              {toast.title}
            </Text>
          )}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {toast.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const useToast = () => {
  return {
    show: (msg: string) => DeviceEventEmitter.emit("showToast", msg),
    success: (msg: string) => DeviceEventEmitter.emit("showToastSuccess", msg),
    error: (msg: string) => DeviceEventEmitter.emit("showToastError", msg),
    info: (msg: string) => DeviceEventEmitter.emit("showToastInfo", msg),
    custom: (data: {
      title?: string;
      message: string;
      type: "ERROR" | "SUCCESS" | "WARN" | "INFO";
    }) => DeviceEventEmitter.emit("showToastCustom", data),
  };
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: getStatusBarHeight(true) + 10,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
