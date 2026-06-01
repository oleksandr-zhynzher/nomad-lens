import { useLangPrefix } from "@core/hooks";
import { INFO_PAGES } from "@core/utils";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { computeActiveView, computeLangSwitchPath } from "./layout.utils";
import { LayoutHeader } from "./LayoutHeader";
import { MobileMenu } from "./MobileMenu";

interface LayoutProps {
  readonly children: ReactNode;
  readonly activePage?: "data-sources" | "indicators" | "ai-indicators" | "budget-categories";
}

export function Layout({ children }: LayoutProps) {
  const { pathname, search } = useLocation();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langSwitchPath = (targetLang: string) =>
    computeLangSwitchPath(targetLang, pathname, langPrefix, search);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const isInfoPage = INFO_PAGES.some((pagePath) => pathname.endsWith(pagePath));
  const activeView = computeActiveView(pathname, isInfoPage);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-slate-100">
      <LayoutHeader
        activeView={activeView}
        langPrefix={langPrefix}
        pathname={pathname}
        currentLangCode={i18n.language}
        langSwitchPath={langSwitchPath}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => {
          setMobileMenuOpen((previous) => !previous);
        }}
      />

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
        }}
        activeView={activeView}
        langPrefix={langPrefix}
        pathname={pathname}
        langSwitchPath={langSwitchPath}
        currentLangCode={i18n.language}
      />

      <main
        className={activeView === "compare" ? "" : "mx-auto w-full max-w-7xl px-4 pb-4 md:pb-6"}
      >
        {children}
      </main>

      <footer className="mt-16 border-t border-border px-4 py-6 text-center text-xs text-dim">
        {t("footer.data")}
      </footer>
    </div>
  );
}
