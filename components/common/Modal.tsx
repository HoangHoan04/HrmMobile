import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal as RNModal,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export const Modal = ({ isOpen, onClose, children }: any) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={{ width: "100%" }}>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

export const ModalContent = ({ children, style }: any) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        {
          backgroundColor: theme.cardBg,
          borderRadius: 16,
          overflow: "hidden",
          width: "100%",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const ModalHeader = ({ children }: any) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  return (
    <View
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {children}
    </View>
  );
};

export const ModalBody = ({ children }: any) => {
  return <View style={{ padding: 16 }}>{children}</View>;
};

export const ModalFooter = ({ children }: any) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  return (
    <View
      style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        flexDirection: "row",
        justifyContent: "flex-end",
      }}
    >
      {children}
    </View>
  );
};

export const ModalCloseButton = ({ onPress }: any) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  return (
    <TouchableOpacity onPress={onPress}>
      <Feather name="x" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

export const ModalBackdrop = () => null;
