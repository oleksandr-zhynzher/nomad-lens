export function headerNavBtnClass(isActive: boolean): string {
  return `header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] transition-colors ${isActive ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-muted"}`;
}

export function headerNavLinkClass(isActive: boolean): string {
  return `header-nav-item flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] no-underline transition-colors ${isActive ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-muted"}`;
}

export function mobileNavBtnClass(isActive: boolean): string {
  return `flex items-center justify-center gap-1.5 rounded px-3 py-2 text-[13px] transition-colors ${isActive ? "bg-accent font-medium text-white" : "bg-surface-4 font-normal text-muted"}`;
}

export function mobileNavLinkClass(isActive: boolean): string {
  return `flex items-center justify-center gap-1.5 rounded px-3 py-2 text-[13px] no-underline transition-colors ${isActive ? "bg-accent font-medium text-white" : "bg-surface-4 font-normal text-muted"}`;
}
