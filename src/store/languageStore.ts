import { translations } from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  dynamicTranslations: any;
  setLanguage: (language: Language) => void;
  initLanguage: () => Promise<void>;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const deepMerge = (target: any, source: any) => {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const output = Object.assign({}, target);
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) Object.assign(output, { [key]: source[key] });
      else output[key] = deepMerge(target[key], source[key]);
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "vi",
  dynamicTranslations: null,

  setLanguage: async (language: Language) => {
    await AsyncStorage.setItem("appLanguage", language);
    set({ language });
  },

  initLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang === "vi" || savedLang === "en") {
        set({ language: savedLang });
      }

      const cachedTranslations = await AsyncStorage.getItem("appTranslations");
      if (cachedTranslations) {
        set({ dynamicTranslations: JSON.parse(cachedTranslations) });
      }
    } catch (e) {
      //! Handle error if needed
    }
  },

  t: (path: string, params?: Record<string, string | number>) => {
    const { language, dynamicTranslations } = get();
    const keys = path.split(".");

    let current: any =
      dynamicTranslations && dynamicTranslations[language]
        ? deepMerge(translations[language], dynamicTranslations[language])
        : translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }

    let result = typeof current === "string" ? current : path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, "g"),
          String(value),
        );
      });
    }
    return result;
  },
}));
