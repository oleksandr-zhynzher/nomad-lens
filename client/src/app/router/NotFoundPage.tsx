import { Layout } from "@core/ui/layout";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-semibold tracking-[1.5px] text-dim uppercase">404</p>
        <h1 className="text-2xl font-semibold text-on-surface">
          {t("notFound.title", "Page not found")}
        </h1>
        <p className="text-sm text-muted">
          {t("notFound.description", "The page you requested does not exist or was moved.")}
        </p>
        <Link
          to="/"
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black no-underline"
        >
          {t("notFound.home", "Go to home")}
        </Link>
      </section>
    </Layout>
  );
}
