import { Colors } from "@/constants/common/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface AuthFieldProps {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}

/** Label + control + optional inline error, used by the auth forms. */
export function AuthField({ label, error, children }: AuthFieldProps) {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.textMain,
          marginLeft: 2,
        }}
      >
        {label}
      </Text>
      {children}
      {error ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginLeft: 2,
          }}
        >
          <Feather name="alert-circle" size={13} color={theme.danger} />
          <Text style={{ fontSize: 12, color: theme.danger }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Shared visual style for text inputs on the auth screens. */
export function useAuthInputStyle() {
  const scheme = useColorScheme() ?? "light";
  // borderColor is intentionally left to <Input> so its focus/invalid colors show.
  return {
    height: 54,
    borderRadius: 14,
    fontSize: 15,
    backgroundColor: scheme === "dark" ? "#141416" : "#F8FAFC",
    paddingHorizontal: 14,
  };
}

/** Leading icon for auth inputs. */
export function AuthInputIcon({
  name,
  active,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  active?: boolean;
}) {
  const theme = Colors[useColorScheme() ?? "light"];
  return (
    <View style={{ marginRight: 10 }}>
      <Feather
        name={name}
        size={18}
        color={active ? theme.primary : theme.textSecondary}
      />
    </View>
  );
}
