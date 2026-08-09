import { Colors } from "@/constants/common/Colors";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { t } = useLanguageStore();

  const renderTabButton = (route: any, indexInState: number) => {
    const isFocused = state.index === indexInState;

    const onPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
    let label = "";

    if (route.name === "index") {
      iconName = isFocused ? "home" : "home-outline";
      label = t("tabs.home");
    } else if (route.name === "checkin") {
      iconName = isFocused ? "finger-print" : "finger-print-outline";
      label = t("tabs.checkin");
    } else if (route.name === "leave") {
      iconName = isFocused ? "document-text" : "document-text-outline";
      label = t("tabs.leave");
    } else if (route.name === "salary") {
      iconName = isFocused ? "cash" : "cash-outline";
      label = t("tabs.salary");
    } else if (route.name === "profile") {
      iconName = isFocused ? "person" : "person-outline";
      label = t("tabs.profile");
    }

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        style={[
          styles.tabButton,
          isFocused
            ? [styles.tabButtonActive, { backgroundColor: "#FFFFFF" }]
            : styles.tabButtonInactive,
        ]}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={isFocused ? "#111214" : "rgba(255, 255, 255, 0.4)"}
        />

        {isFocused && (
          <Text
            numberOfLines={1}
            style={[styles.tabLabel, { color: "#111214" }]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.absoluteWrapper, { bottom: Math.max(insets.bottom, 16) }]}
    >
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: "#111214",
            shadowColor: "#000",
          },
        ]}
      >
        {state.routes.map((route, index) => renderTabButton(route, index))}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: "#FFF",
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Trang Chủ" }} />
      <Tabs.Screen name="checkin" options={{ title: "Chấm Công" }} />
      <Tabs.Screen name="leave" options={{ title: "Bảng công" }} />
      <Tabs.Screen name="salary" options={{ title: "Bảng Lương" }} />
      <Tabs.Screen name="profile" options={{ title: "Cá Nhân" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  absoluteWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_WIDTH * 0.94,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
  },
  tabButtonActive: {
    flex: 1.8,
    paddingHorizontal: 12,
    gap: 6,
  },
  tabButtonInactive: {
    flex: 1,
    paddingHorizontal: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
});
