import { Colors } from "@/constants/common/Colors";
import React from "react";
import {
  useColorScheme,
  Modal as RNModal,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export const AlertDialog = ({ isOpen, onClose, children }: any) => {
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

export const AlertDialogContent = ({ children, style }: any) => {
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

export const AlertDialogHeader = ({ children }: any) => {
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

export const AlertDialogBody = ({ children }: any) => {
  return <View style={{ padding: 16 }}>{children}</View>;
};

export const AlertDialogFooter = ({ children }: any) => {
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

export const AlertDialogCloseButton = ({ onPress }: any) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  return (
    <TouchableOpacity onPress={onPress}>
      <Feather name="x" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

export const AlertDialogBackdrop = () => null;
