import { extractApiError } from "@/features/common/apiError";
import type { ApiErrorLike } from "@/features/common/apiError.types";
import { useLanguageStore } from "@/store/languageStore";
import { useCallback } from "react";

export function useApiError() {
  const translate = useLanguageStore((s) => s.t);

  const getErrorMessage = useCallback(
    (error: unknown, fallbackKeyOrText: string) => {
      const fallback = fallbackKeyOrText.includes(".")
        ? translate(fallbackKeyOrText)
        : fallbackKeyOrText;
      return extractApiError(error, fallback);
    },
    [translate],
  );

  const getFallback = useCallback(
    (fallbackKey: string) => translate(fallbackKey),
    [translate],
  );

  return {
    extractApiError,
    getErrorMessage,
    getFallback,
    t: translate,
  };
}

export type { ApiErrorLike };
