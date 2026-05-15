import { useEffect, useState } from "react";

export function useHomeStickyScroll(sentinelRef: React.RefObject<HTMLDivElement | null>): boolean {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const HEADER_H = 57;
    let ticking = false;
    const update = () => {
      const rect = sentinelRef.current?.getBoundingClientRect();
      if (rect) setIsSticky(rect.top < HEADER_H);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [sentinelRef]);

  return isSticky;
}
