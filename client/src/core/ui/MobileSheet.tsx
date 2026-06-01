import { useBodyScrollLock, useFocusTrap } from "@core/hooks";
import { X } from "lucide-react";
import { type ReactNode, useId, useRef } from "react";

interface MobileSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly closeLabel: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
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
      className="fixed inset-0 z-50 flex md:hidden"
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
        className="relative mt-auto flex max-h-[calc(100dvh-16px)] min-h-[70vh] w-full flex-col overflow-hidden overscroll-contain rounded-tl-[24px] rounded-tr-[24px] border-t border-[#2A2A2A] bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-18px_42px_rgba(0,0,0,0.45)]"
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden="true">
          <div className="h-1 w-9 rounded-[2px] bg-[#444444]" />
        </div>
        <div className="flex shrink-0 items-center justify-between px-4 pb-2">
          <h2 id={titleId} className="text-xs font-semibold tracking-[1.5px] text-muted uppercase">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-[4px] bg-border text-muted"
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
