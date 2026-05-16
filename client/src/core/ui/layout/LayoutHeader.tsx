import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DesktopNav } from "./DesktopNav";
import { LangDropdown } from "./LangDropdown";
import type { NavView } from "./layout.utils";
import { LogoMark } from "./LogoMark";

interface LayoutHeaderProps {
  readonly activeView: NavView | null;
  readonly onViewClick: (view: NavView) => void;
  readonly langPrefix: string;
  readonly pathname: string;
  readonly currentLangCode: string;
  readonly langSwitchPath: (targetLang: string) => string;
  readonly mobileMenuOpen: boolean;
  readonly onLogoClick: () => void;
  readonly onToggleMobileMenu: () => void;
}

export function LayoutHeader({
  activeView,
  onViewClick,
  langPrefix,
  pathname,
  currentLangCode,
  langSwitchPath,
  mobileMenuOpen,
  onLogoClick,
  onToggleMobileMenu,
}: LayoutHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#252525] bg-[#0D0E10]">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4">
        <button
          onClick={onLogoClick}
          className="-mt-1 flex h-8 cursor-pointer items-center gap-2.5 border-none bg-transparent p-0 leading-none"
        >
          <LogoMark size={32} />
          <span className="-mt-1 flex h-8 items-center [font-family:Oswald,_sans-serif] text-[20px] leading-none font-bold tracking-[2px] uppercase">
            NOMAD LENS
          </span>
        </button>

        <div className="hidden items-center gap-4 md:flex">
          <DesktopNav
            activeView={activeView}
            onViewClick={onViewClick}
            langPrefix={langPrefix}
            pathname={pathname}
          />
          <LangDropdown currentLangCode={currentLangCode} langSwitchPath={langSwitchPath} />
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center text-muted md:hidden"
          onClick={onToggleMobileMenu}
          aria-label={t("a11y.toggleMenu", "Toggle menu")}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
