type SessionExpiredHandler = () => void | Promise<void>;
type TokenRefreshedHandler = (accessToken: string) => void;

let onSessionExpired: SessionExpiredHandler | null = null;
let onTokenRefreshed: TokenRefreshedHandler | null = null;

export function setSessionExpiredHandler(
  handler: SessionExpiredHandler | null,
): void {
  onSessionExpired = handler;
}

export function setTokenRefreshedHandler(
  handler: TokenRefreshedHandler | null,
): void {
  onTokenRefreshed = handler;
}

export async function notifySessionExpired(): Promise<void> {
  try {
    await onSessionExpired?.();
  } catch {
    //! Ignore handler errors — token cache is already cleared by caller.
  }
}

export function notifyTokenRefreshed(accessToken: string): void {
  try {
    onTokenRefreshed?.(accessToken);
  } catch {
    //! Ignore
  }
}
