export { t } from "./i18n";
export type { TranslateParams } from "./i18n";

export { pickString, pickTrimmedString } from "./string";

export {
  formatClock,
  formatDisplayDate,
  getLocalizedDate,
  parseInputDateToIso,
  parseWorkDate,
} from "./date";

export type {
  ApiErrorBody,
  ApiErrorLike,
  ApiErrorResponse,
  ExtractApiErrorOptions,
} from "./apiError.types";

export {
  extractApiError,
  getApiErrorMessage,
  isApiErrorLike,
  isNetworkError,
} from "./apiError";

export { useApiError } from "./useApiError";
