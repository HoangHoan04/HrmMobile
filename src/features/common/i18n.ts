import { useLanguageStore } from "@/store/languageStore";

export type TranslateParams = Record<string, string | number>;

export function t(path: string, params?: TranslateParams): string {
  return useLanguageStore.getState().t(path, params);
}
