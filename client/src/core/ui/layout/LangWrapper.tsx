import { isSupportedLang } from "@core/utils";
import i18n from "@i18n";
import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

export function LangWrapper() {
  const { lang } = useParams<{ lang?: string }>();

  const isInvalidLang = lang !== undefined && !isSupportedLang(lang);
  const activeLang = isInvalidLang ? "en" : (lang ?? "en");

  // Always call hooks unconditionally before any early return
  useEffect(() => {
    if (!isInvalidLang && i18n.language !== activeLang) {
      void i18n.changeLanguage(activeLang);
    }
  }, [activeLang, isInvalidLang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = activeLang === "ua" ? "uk" : activeLang;
  }, [activeLang]);

  // If a lang segment is present but not supported, redirect to root
  if (isInvalidLang) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
