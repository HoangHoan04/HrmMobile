import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_ENABLED_KEY = "BIOMETRIC_UNLOCK_ENABLED";

export async function getBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
}

export async function tryLocalAuth(
  promptMessage: string,
): Promise<{ ok: boolean; available: boolean; message?: string }> {
  try {
    const LocalAuthentication = require("expo-local-authentication");
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      return {
        ok: false,
        available: false,
        message: "Biometric hardware not available or not enrolled",
      };
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    return { ok: !!result.success, available: true };
  } catch {
    return {
      ok: false,
      available: false,
      message:
        "expo-local-authentication not installed — preference saved only (stub)",
    };
  }
}
