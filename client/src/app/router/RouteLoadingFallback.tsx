import { useTranslation } from "react-i18next";

export function RouteLoadingFallback() {
  const { t } = useTranslation();

  return (
    <output
      className="flex min-h-screen items-center justify-center bg-bg text-dim"
      aria-live="polite"
    >
      <span className="text-sm">{t("loading", "Loading…")}</span>
    </output>
  );
}
