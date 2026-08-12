export type ApiErrorBody = {
  message?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
};

export type ApiErrorResponse = {
  data?: string | ApiErrorBody;
  status?: number;
  statusText?: string;
};

export type ApiErrorLike = {
  message?: string;
  response?: ApiErrorResponse;
  code?: string;
};

export type ExtractApiErrorOptions = {
  preferResponse?: boolean;
};
