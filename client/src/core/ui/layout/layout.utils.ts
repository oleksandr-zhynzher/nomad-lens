import type { NavigateFunction } from "react-router-dom";

export type NavView = "list" | "map" | "compare";

export function navigateToView(
  view: NavView,
  langPrefix: string,
  navigate: NavigateFunction,
  onNavigate: () => void,
): void {
  if (view === "list") {
    void navigate(langPrefix !== "" ? langPrefix : "/");
  } else {
    void navigate(`${langPrefix}/${view}`);
  }
  onNavigate();
}

export function makeClickOutsideHandler(
  ref: React.RefObject<HTMLDivElement | null>,
  onClose: () => void,
): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    if (ref.current != null && !ref.current.contains(event.target as Node)) {
      onClose();
    }
  };
}

export function computeLangSwitchPath(
  targetLang: string,
  pathname: string,
  langPrefix: string,
  search: string,
): string {
  let rest = pathname;
  if (langPrefix !== "" && rest.startsWith(langPrefix)) {
    const sliced = rest.slice(langPrefix.length);
    rest = sliced !== "" ? sliced : "/";
  }
  const prefix = targetLang === "en" ? "" : `/${targetLang}`;
  return `${prefix}${rest}${search}`;
}

export function computeActiveView(
  pathname: string,
  isInfoPage: boolean,
): "list" | "map" | "compare" | null {
  if (pathname.endsWith("/map")) return "map";
  if (pathname.endsWith("/compare")) return "compare";
  if (isInfoPage) return null;
  return "list";
}
