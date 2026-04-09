import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ua from "./locales/ua.json";
import ru from "./locales/ru.json";

const uaPluralAlias = {
  type: "3rdParty" as const,
  init(instance: typeof i18n) {
    const pluralResolver = instance.services.pluralResolver;
    const originalGetRule = pluralResolver.getRule.bind(pluralResolver);
    type GetRuleCode = Parameters<typeof originalGetRule>[0];
    type GetRuleOptions = Parameters<typeof originalGetRule>[1];

    pluralResolver.getRule = (code: GetRuleCode, options?: GetRuleOptions) =>
      originalGetRule(code === "ua" ? "uk" : code, options);
  },
};

i18n
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

export default i18n;
