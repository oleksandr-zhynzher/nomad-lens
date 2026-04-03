import { useParams } from "react-router-dom";

/**
 * Returns the route prefix for the current language.
 * - English (default): ""
 * - Ukrainian: "/ua"
 * - Russian: "/ru"
 *
 * Use this to prefix all <Link to=...> paths so navigation
 * stays within the currently active language.
 */
export function useLangPrefix(): string {
  const { lang } = useParams<{ lang?: string }>();
  if (lang === "ua" || lang === "ru") return `/${lang}`;
  return "";
}
