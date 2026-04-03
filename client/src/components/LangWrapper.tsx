import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import i18n from "../i18n";

const SUPPORTED_LANGS = ["ua", "ru"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isSupportedLang(lang: string): lang is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(lang);
}

export function LangWrapper() {
  const { lang } = useParams<{ lang?: string }>();

  // If a lang segment is present but not supported, redirect to root
  if (lang !== undefined && !isSupportedLang(lang)) {
    return <Navigate to="/" replace />;
  }

  const activeLang = lang ?? "en";

  useEffect(() => {
    if (i18n.language !== activeLang) {
      i18n.changeLanguage(activeLang);
    }
  }, [activeLang]);

  return <Outlet />;
}
