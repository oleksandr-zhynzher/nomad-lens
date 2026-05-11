import { useTranslation } from "react-i18next";

export function RouteLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--color-bg)", color: "#8A8A8A" }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
        {t("loading", "Loading…")}
      </span>
    </div>
  );
}
