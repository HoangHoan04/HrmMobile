import { Colors } from "@/constants/common/Colors";
import React from "react";
import { useColorScheme, View, Text } from "react-native";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  flex?: number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
}: TableProps<T>) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.background,
          padding: 12,
          gap: 16,
        }}
      >
        {columns.map((col, idx) => (
          <View key={idx} style={{ flex: col.flex ?? 1 }}>
            <Text
              style={{
                fontWeight: "bold",
                color: theme.textMain,
                fontSize: 14,
              }}
            >
              {col.header}
            </Text>
          </View>
        ))}
      </View>
      {data.map((item, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: "row",
            padding: 12,
            borderBottomWidth: rowIdx === data.length - 1 ? 0 : 1,
            borderBottomColor: theme.border,
            gap: 16,
          }}
        >
          {columns.map((col, colIdx) => (
            <View key={colIdx} style={{ flex: col.flex ?? 1 }}>
              {col.render ? (
                col.render(item)
              ) : (
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                  {String(item[col.key])}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
