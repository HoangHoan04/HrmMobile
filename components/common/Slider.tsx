import { Colors } from "@/constants/common/Colors";
import SliderComponent from "@react-native-community/slider";
import React from "react";
import { useColorScheme, View } from "react-native";

interface CustomSliderProps {
  value: number;
  onChange: (val: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  isDisabled?: boolean;
}

export const Slider = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 100,
  step = 1,
  isDisabled = false,
}: CustomSliderProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={{ width: "100%", height: 40, justifyContent: "center" }}>
      <SliderComponent
        style={{ width: "100%", height: 40 }}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={step}
        value={value}
        onValueChange={onChange}
        disabled={isDisabled}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.border}
        thumbTintColor={theme.primary}
      />
    </View>
  );
};
