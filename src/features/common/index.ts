export { t } from "./i18n";
export type { TranslateParams } from "./i18n";

export { pickString, pickTrimmedString } from "./string";

export {
  clockOrEmpty,
  formatClock,
  formatDisplayDate,
  getLocalizedDate,
  parseHhMmToTimeSpan,
  parseInputDateToIso,
  parseWorkDate,
  toDateOnly,
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
