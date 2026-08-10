import * as SecureStore from "expo-secure-store";

export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const RF_TOKEN = "RF_TOKEN";
export const USER_LOGIN = "USER_LOGIN";
export const TOKEN_FCM_FIREBASE = "TOKEN_FCM_FIREBASE";

export enum EKeyCheck {
  STRING,
  THAN_ZERO,
  THAN_EQ_ZERO,
  LESS_ZERO,
  LESS_EQ_ZERO,
}

const secureStorage = {
  saveToken: async (value: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN, value);
  },

  saveIsPayment: async (value: boolean) => {
    await SecureStore.setItemAsync("isPayment", value.toString());
  },
  clearIsPayment: async () => {
    await SecureStore.deleteItemAsync("isPayment");
  },
  getIsPayment: async () => {
    return await SecureStore.getItemAsync("isPayment");
  },
  saveUserLoginData: async (value: { username: string; password: string }) => {
    await SecureStore.setItemAsync(USER_LOGIN, JSON.stringify(value));
  },
  getUserLoginData: async () => {
    return await SecureStore.getItemAsync(USER_LOGIN);
  },
  getToken: async () => {
    let result = await SecureStore.getItemAsync(ACCESS_TOKEN);
    return result;
  },
  getRfToken: async () => {
    let result = await SecureStore.getItemAsync(RF_TOKEN);
    return result;
  },
  saveRfToken: async (value: string) => {
    await SecureStore.setItemAsync(RF_TOKEN, value);
  },
  clearDataLogin: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(USER_LOGIN);
    await SecureStore.deleteItemAsync(RF_TOKEN);
  },

  verifyField: (object: any, checkType: EKeyCheck[]) => {
    let missingFiled: string[] = [];
    Object.keys(object).map((key) => {
      if (checkType.includes(EKeyCheck.STRING) && !object[key]) {
        missingFiled.push(key);
      }
    });
    return missingFiled;
  },
};

export default secureStorage;
