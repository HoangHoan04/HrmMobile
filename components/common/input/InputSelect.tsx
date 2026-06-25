import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useColorScheme, View, Text, TouchableOpacity, Modal, FlatList } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface CustomInputSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Option[];
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const InputSelect = ({
  value,
  onValueChange,
  placeholder = "Chọn...",
  options,
  isDisabled,
  isInvalid,
}: CustomInputSelectProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        onPress={() => setIsOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderColor: isInvalid ? theme.danger : isOpen ? theme.primary : theme.border,
          backgroundColor: isDisabled ? theme.background : theme.cardBg,
          borderWidth: 1,
          borderRadius: 12,
          height: 48,
          paddingHorizontal: 12,
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <Text style={{ color: selectedOption ? theme.textMain : theme.textSecondary, fontSize: 14 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 16,
              maxHeight: 400,
              overflow: "hidden",
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.background,
                    backgroundColor: item.value === value ? theme.background : "transparent",
                  }}
                  onPress={() => {
                    if (onValueChange) onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={{
                      color: item.value === value ? theme.primary : theme.textMain,
                      fontWeight: item.value === value ? "bold" : "normal",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
