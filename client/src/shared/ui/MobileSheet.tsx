import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useFocusTrap } from "../hooks/useFocusTrap";

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
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative mt-auto flex w-full flex-col overflow-hidden"
        style={{
          minHeight: "70vh",
          maxHeight: "calc(100dvh - 16px)",
          backgroundColor: "#1A1A1A",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          borderTop: "1px solid #2A2A2A",
          boxShadow: "0 -18px 42px rgba(0,0,0,0.45)",
          overscrollBehavior: "contain",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#444444",
            }}
          />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2
            id={titleId}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#9E9E9E",
            }}
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              backgroundColor: "#333333",
              color: "#9E9E9E",
            }}
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
