import React from "react";
import { Card } from "@/components/common/Card";
import { Badge, BadgeText } from "@/components/common/Badge";
import { Button } from "@/components/common/button/Button";
import { Colors } from "@/constants/Colors";
import { useColorScheme, View, Text } from "react-native";

const mockLeaves = [
  { id: "1", type: "Nghỉ phép", status: "Đang duyệt", days: 2 },
  { id: "2", type: "Nghỉ ốm", status: "Đã duyệt", days: 1 },
];

export default function LeaveScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <View style={{ gap: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.textMain }}>Đơn Từ</Text>
          <View style={{ width: 120 }}>
            <Button label="Tạo Đơn" onPress={() => {}} />
          </View>
        </View>

        {mockLeaves.map((item) => (
          <Card key={item.id} padding={16}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontWeight: "bold", color: theme.textMain }}>{item.type}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {item.days} ngày
                </Text>
              </View>
              <Badge
                action={item.status === "Đã duyệt" ? "success" : "warning"}
              >
                <BadgeText>{item.status}</BadgeText>
              </Badge>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
