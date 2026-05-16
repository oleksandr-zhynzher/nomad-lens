import { useState, useRef, useEffect } from "react";

const PAGE_SIZE = 50;

/**
 * Paginate a list with IntersectionObserver-based infinite scroll.
 *
 * @param items    - The full sorted array to paginate.
 * @param disabled - When `true` (e.g. active search), all items are returned
 *                   immediately and the observer is not attached.
 */
export function useInfiniteScroll<T>(items: T[], disabled = false) {
  const [pagination, setPagination] = useState({
    prevItems: items,
    visibleCount: PAGE_SIZE,
  });
  const { prevItems, visibleCount } = pagination;

  // Reset pagination whenever the items list identity changes (React-recommended
  // pattern for deriving state from props without a useEffect).
  if (prevItems !== items) {
    setPagination({ prevItems: items, visibleCount: PAGE_SIZE });
  }

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPagination((s) =>
            s.visibleCount < s.prevItems.length
              ? { ...s, visibleCount: s.visibleCount + PAGE_SIZE }
              : s,
          );
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [disabled, items]);

  const visible = disabled ? items : items.slice(0, visibleCount);
  const hasMore = !disabled && visibleCount < items.length;

  return { visible, hasMore, sentinelRef };
}
