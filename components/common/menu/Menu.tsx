import { Colors } from "@/constants/Colors";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MenuItem {
  label: string;
  value: any;
  icon?: React.ReactNode;
}

interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  onSelect: (value: any) => void;
}

export const Menu = ({ trigger, items, onSelect }: MenuProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showMenu = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 350,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
    });
  };

  const handleSelect = (value: any) => {
    hideMenu(() => onSelect(value));
  };

  return (
    <View>
      <Pressable onPress={showMenu}>{trigger}</Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => hideMenu()}
      >
        <View style={styles.container}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable
              style={styles.backdropPressable}
              onPress={() => hideMenu()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.indicator,
                { backgroundColor: theme.border || "#E2E8F0" },
              ]}
            />

            <View style={styles.itemsContainer}>
              {items.map((item, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      borderBottomWidth: index === items.length - 1 ? 0 : 0.5,
                      borderBottomColor: theme.border,
                      backgroundColor: pressed
                        ? colorScheme === "light"
                          ? "#F7FAFC"
                          : "#2D3748"
                        : "transparent",
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  {item.icon && (
                    <View style={styles.iconContainer}>{item.icon}</View>
                  )}
                  <Text style={[styles.itemText, { color: theme.textMain }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor: pressed
                    ? colorScheme === "light"
                      ? "#EDF2F7"
                      : "#4A5568"
                    : colorScheme === "light"
                      ? "#F7FAFC"
                      : "#2D3748",
                  borderColor: theme.border,
                },
              ]}
              onPress={() => hideMenu()}
            >
              <Text style={[styles.cancelText, { color: theme.textMain }]}>
                {colorScheme === "light" ? "Đóng" : "Close"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area padding for bottom screen edge
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  itemsContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 14,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
