import { useTranslation } from "react-i18next";

export function RouteLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg text-dim"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm">{t("loading", "Loading…")}</span>
    </div>
  );
}
