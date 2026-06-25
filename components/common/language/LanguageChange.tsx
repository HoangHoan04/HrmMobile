import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Menu } from "../menu/Menu";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";

interface LanguageChangeProps {
  color?: string;
}

export const LanguageChange = ({ color = "#FFFFFF" }: LanguageChangeProps) => {
  const { language, setLanguage } = useLanguageStore();

  const items = [
    {
      label: "Tiếng Việt",
      value: "vi",
      icon: <Text style={{ fontSize: 18 }}>🇻🇳</Text>,
    },
    {
      label: "English",
      value: "en",
      icon: <Text style={{ fontSize: 18 }}>🇬🇧</Text>,
    },
  ];

  const flag = language === "vi" ? "🇻🇳" : "🇬🇧";

  const trigger = (
    <View style={[styles.triggerContainer, { borderColor: color }]}>
      <Text style={{ fontSize: 16 }}>{flag}</Text>
      <Text style={[styles.triggerText, { color }]}>
        {language === "vi" ? "VI" : "EN"}
      </Text>
      <Ionicons name="chevron-down" size={10} color={color} style={{ marginLeft: 2 }} />
    </View>
  );

  return (
    <Menu
      trigger={trigger}
      items={items}
      onSelect={(val) => setLanguage(val)}
    />
  );
};

const styles = StyleSheet.create({
  triggerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
