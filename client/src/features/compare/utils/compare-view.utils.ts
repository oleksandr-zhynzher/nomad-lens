export type SortDirection = "desc" | "asc" | null;

export function delayedReset(setter: (v: false) => void, delayMs: number): void {
  setTimeout(() => {
    setter(false);
  }, delayMs);
}

export function applyPanelHeight(el: HTMLDivElement | null): void {
  if (el == null) return;
  const top = el.getBoundingClientRect().top;
  el.style.height = `${window.innerHeight - Math.max(top, 16) - 16}px`;
}

export function getActionGridClass(showSort: boolean): string {
  return showSort ? "grid-cols-3" : "grid-cols-2";
}

export function getSortIconClass(direction: SortDirection): string {
  return direction === "asc" ? "rotate-180" : "rotate-0";
}
