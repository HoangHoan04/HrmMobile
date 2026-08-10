import { Dimensions, PixelRatio, Platform, StatusBar } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";

export function hasNotch() {
  const insets = initialWindowMetrics?.insets;
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTV &&
    ((insets?.bottom ?? 0) > 0 || (insets?.top ?? 0) > 20)
  );
}
const { width, height } = Dimensions.get("window");

export const deviceWidth = width;
export const deviceHeight = height;
export function ifNotch(notchStyle: any, regularStyle: any) {
  if (hasNotch()) {
    return notchStyle;
  }
  return regularStyle;
}

export function getStatusBarHeight(safe: boolean) {
  const insets = initialWindowMetrics?.insets;
  return Platform.select({
    ios: insets ? insets.top : hasNotch() ? (safe ? 44 : 35) : 20,
    android: StatusBar.currentHeight || 0,
    default: 0,
  });
}

export function getBottomSpace() {
  const insets = initialWindowMetrics?.insets;
  return insets ? insets.bottom : hasNotch() ? 34 : 0;
}

export const keyboardAvoidingBehavior =
  Platform.OS === "ios" ? "padding" : undefined;

export const widthPercentageToDP = (widthPercent: number) => {
  const elemWidth =
    typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((deviceWidth * elemWidth) / 100);
};

export function getCurrentMonth() {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  return currentMonth;
}

export function getMonth() {
  return new Date();
}

export const isIOS = Platform.OS === "ios";
