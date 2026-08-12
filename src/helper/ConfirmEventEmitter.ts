import type {
  ConfirmAsyncOptions,
  ConfirmOptions,
} from "@/components/ui/confirm/types";
import { useLanguageStore } from "@/store/languageStore";
import { DeviceEventEmitter } from "react-native";
export const CONFIRM_SHOW_EVENT = "showConfirmDialog";
export const CONFIRM_HIDE_EVENT = "hideConfirmDialog";

export function showConfirm(options: ConfirmOptions): void {
  DeviceEventEmitter.emit(CONFIRM_SHOW_EVENT, options);
}

export function hideConfirm(): void {
  DeviceEventEmitter.emit(CONFIRM_HIDE_EVENT);
}

export function showAlert(
  title: string,
  message?: string,
  options?: Pick<ConfirmOptions, "variant" | "dismissible"> & {
    okText?: string;
  },
): void {
  const t = useLanguageStore.getState().t;
  showConfirm({
    title,
    message,
    variant: options?.variant ?? "info",
    dismissible: options?.dismissible ?? true,
    buttons: [
      {
        text: options?.okText ?? t("common.ok"),
        style: "default",
      },
    ],
  });
}

export function confirmAsync(options: ConfirmAsyncOptions): Promise<boolean> {
  const t = useLanguageStore.getState().t;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    showConfirm({
      title: options.title,
      message: options.message,
      variant: options.variant ?? (options.destructive ? "warning" : "confirm"),
      dismissible: options.dismissible ?? true,
      onDismiss: () => finish(false),
      buttons: [
        {
          text: options.cancelText ?? t("common.cancel"),
          style: "cancel",
          onPress: () => finish(false),
        },
        {
          text: options.confirmText ?? t("common.confirm"),
          style: options.destructive ? "destructive" : "default",
          onPress: () => finish(true),
        },
      ],
    });
  });
}
