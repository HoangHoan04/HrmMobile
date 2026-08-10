import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_FCM_FIREBASE } from "../services/storage/secureStorage";

class CoreHelper {
  static async saveFCMToken(token: string) {
    await AsyncStorage.setItem(TOKEN_FCM_FIREBASE, token);
  }

  static async getFCMToken() {
    return await AsyncStorage.getItem(TOKEN_FCM_FIREBASE);
  }

  static formatNumber(num = 0): string {
    const [intPart, decimalPart] = num
      ? num.toFixed(2).split(".")
      : ["0", "00"];
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return decimalPart == "00"
      ? formattedInt
      : `${formattedInt},${decimalPart}`;
  }

  static toDict<T>(array: T[], key: keyof T): Record<string, T> {
    return array.reduce(
      (acc, item) => {
        const keyValue = item[key];
        if (keyValue !== undefined && keyValue !== null) {
          acc[String(keyValue)] = item;
        }
        return acc;
      },
      {} as Record<string, T>,
    );
  }
}

export default CoreHelper;
