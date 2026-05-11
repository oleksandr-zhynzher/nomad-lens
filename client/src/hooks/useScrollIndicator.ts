import { useRef, useCallback, useEffect } from "react";

/**
 * Attaches a CSS class `"scrolling"` to a container ref while the user is
 * actively scrolling, and removes it `delay` ms after the last scroll event.
 *
 * @param delay - Milliseconds of inactivity before the class is removed (default 800).
 */
export function useScrollIndicator(delay = 800) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onScroll = useCallback(() => {
    scrollRef.current?.classList.add("scrolling");
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      scrollRef.current?.classList.remove("scrolling");
    }, delay);
  }, [delay]);

  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  return { scrollRef, onScroll };
}
