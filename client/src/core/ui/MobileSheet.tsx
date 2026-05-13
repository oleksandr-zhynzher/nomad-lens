import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useBodyScrollLock } from "@core/hooks";
import { useFocusTrap } from "@core/hooks";

interface MobileSheetProps {
  open: boolean;
  title: string;
  closeLabel: string;
  children: ReactNode;
  onClose: () => void;
}

export function MobileSheet({ open, title, closeLabel, children, onClose }: MobileSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);
  useFocusTrap({
    active: open,
    containerRef: sheetRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/[0.72] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative mt-auto flex w-full flex-col overflow-hidden min-h-[70vh] max-h-[calc(100dvh-16px)] bg-surface rounded-tl-[24px] rounded-tr-[24px] border-t border-[#2A2A2A] shadow-[0_-18px_42px_rgba(0,0,0,0.45)] overscroll-contain pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
          <div className="w-9 h-1 rounded-[2px] bg-[#444444]" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2 id={titleId} className="text-xs font-semibold tracking-[1.5px] uppercase text-muted">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-border text-muted"
            aria-label={closeLabel}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
