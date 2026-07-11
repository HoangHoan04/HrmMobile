import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/button/Button";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { Text, useColorScheme, View } from "react-native";

export default function CheckInScreen() {
  const [checkedIn, setCheckedIn] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleToggle = () => {
    setCheckedIn((prev) => !prev);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <View style={{ gap: 24, alignItems: "center" }}>
        <View style={{ marginTop: 32, width: "100%" }}>
          <Card padding={32}>
            <View style={{ alignItems: "center", width: "100%" }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  marginBottom: 8,
                  color: theme.textMain,
                }}
              >
                {checkedIn ? "Đã Check-in" : "Chưa Check-in"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  marginBottom: 24,
                }}
              >
                {new Date().toLocaleDateString("vi-VN")}
              </Text>
              <View style={{ width: "100%" }}>
                <Button
                  status={checkedIn ? "danger" : "primary"}
                  label={checkedIn ? "Check-out" : "Check-in"}
                  onPress={handleToggle}
                />
              </View>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
}
