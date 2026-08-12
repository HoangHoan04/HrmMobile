import type {
  ApiErrorBody,
  ApiErrorLike,
  ExtractApiErrorOptions,
} from "@/features/common/apiError.types";
import { t } from "@/features/common/i18n";
import { pickTrimmedString } from "@/features/common/string";
import axios from "axios";

function messageFromBody(
  data: string | ApiErrorBody | undefined,
): string | null {
  if (data == null) return null;
  if (typeof data === "string") return pickTrimmedString(data);

  const direct =
    pickTrimmedString(data.message) ||
    pickTrimmedString(data.detail) ||
    pickTrimmedString(data.title);
  if (direct) return direct;

  if (data.errors && typeof data.errors === "object") {
    for (const value of Object.values(data.errors)) {
      if (Array.isArray(value)) {
        const first = value.find((item) => pickTrimmedString(item));
        if (first) return first.trim();
      } else {
        const single = pickTrimmedString(value);
        if (single) return single;
      }
    }
  }

  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") return false;
    return !error.response;
  }

  if (!error || typeof error !== "object") return false;
  const err = error as ApiErrorLike & { code?: string };
  if (err.response) return false;

  const code = String(err.code || "");
  if (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ERR_NETWORK"
  ) {
    return true;
  }

  const msg = String(err.message || "").toLowerCase();
  return (
    msg.includes("network request failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("timeout")
  );
}

export function extractApiError(
  error: unknown,
  fallback: string,
  _options?: ExtractApiErrorOptions,
): string {
  if (isNetworkError(error)) {
    return t("common.serverUnavailable");
  }

  const err = (error ?? {}) as ApiErrorLike;
  const fromBody = messageFromBody(err.response?.data);
  if (fromBody) return fromBody;

  const fromMessage = pickTrimmedString(err.message);
  if (fromMessage) return fromMessage;

  return fallback;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackKey: string,
): string {
  return extractApiError(error, t(fallbackKey));
}

export function isApiErrorLike(value: unknown): value is ApiErrorLike {
  return !!value && typeof value === "object";
}
