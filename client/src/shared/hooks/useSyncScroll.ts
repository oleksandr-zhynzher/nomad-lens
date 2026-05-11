import { useEffect, type RefObject } from "react";

/**
 * Syncs horizontal scrollLeft between a sticky header and a scrollable body.
 * Scrolling either element mirrors the other.
 */
export function useSyncScroll(
  headerRef: RefObject<HTMLDivElement | null>,
  bodyRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    const header = headerRef.current;
    const body = bodyRef.current;
    if (!header || !body) return;
    const onBody = () => {
      header.scrollLeft = body.scrollLeft;
    };
    const onHeader = () => {
      body.scrollLeft = header.scrollLeft;
    };
    body.addEventListener("scroll", onBody, { passive: true });
    header.addEventListener("scroll", onHeader, { passive: true });
    return () => {
      body.removeEventListener("scroll", onBody);
      header.removeEventListener("scroll", onHeader);
    };
  }, [headerRef, bodyRef]);
}
