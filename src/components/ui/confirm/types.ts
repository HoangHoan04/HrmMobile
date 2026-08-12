export type ConfirmButtonStyle = "default" | "cancel" | "destructive";

export type ConfirmButton = {
  text: string;
  style?: ConfirmButtonStyle;
  onPress?: () => void | Promise<void>;
};

export type ConfirmVariant = "info" | "success" | "warning" | "error" | "confirm";

export type ConfirmOptions = {
  title: string;
  message?: string;
  buttons?: ConfirmButton[];
  variant?: ConfirmVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
};

export type ConfirmAsyncOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  variant?: ConfirmVariant;
  dismissible?: boolean;
};
