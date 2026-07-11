import moment from "moment";
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

export function formatDate(
  text: Date | string | number | undefined,
  format?: string,
) {
  if (!text) return "";
  return moment(text).format(format ? format : "DD/MM/YY");
}
export function formatDateTime(text: Date | string | number | undefined) {
  if (!text) return "";
  return moment(text).format("HH:mm DD/MM/YY");
}

export function isDateInCurrentMonth(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const currentDate = new Date();
  return (
    day === currentDate.getDate() &&
    month === currentDate.getMonth() &&
    year === currentDate.getFullYear()
  );
}

export function formatMoneyD(money?: number | string) {
  if (!!money || money == 0) {
    if (money && money.toString().length > 0) {
      return money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ";
    } else {
      return money + "đ";
    }
  } else {
    return "0đ";
  }
}
export function formatMoneyVND(money: number) {
  if (!!money || money == 0) {
    if (money && money.toString().length > 0) {
      return (
        money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + " VND"
      );
    } else {
      return money + " VND";
    }
  } else {
    return "0 VND";
  }
}

export function replaceMoney(str: string) {
  if (str && typeof str == "string") return str.replace(/\./g, "");
  else return "0";
}

export const isIOS = Platform.OS === "ios";
