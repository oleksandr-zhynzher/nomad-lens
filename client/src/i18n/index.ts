import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import ua from "./locales/ua.json";

const uaPluralAlias = {
  type: "3rdParty" as const,
  init(instance: typeof i18n) {
    interface PluralResolverLike {
      getRule: (code: string, options?: Record<string, unknown>) => unknown;
    }
    const pluralResolver = instance.services.pluralResolver as PluralResolverLike;
    const originalGetRule = pluralResolver.getRule.bind(pluralResolver);

    pluralResolver.getRule = (code: string, options?: Record<string, unknown>) =>
      originalGetRule(code === "ua" ? "uk" : code, options);
  },
};

void i18n
  .use(uaPluralAlias)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ua: { translation: ua },
      ru: { translation: ru },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export { default } from "i18next";
