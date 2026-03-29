import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}

interface Coords {
  x: number;
  y: number;
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ x: r.left + r.width / 2, y: side === "bottom" ? r.bottom : r.top });
    }
  }

  function hide() {
    hideTimer.current = setTimeout(() => setCoords(null), 120);
  }

  const style: CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.x,
        zIndex: 9999,
        ...(side === "bottom"
          ? { top: coords.y + 8 }
          : { top: coords.y - 8, transform: "translateX(-50%) translateY(-100%)" }),
        ...(side === "bottom" ? { transform: "translateX(-50%)" } : {}),
      }
    : {};

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {coords !== null &&
        createPortal(
          <div
            role="tooltip"
            style={style}
            className="pointer-events-none w-56 rounded-lg border border-slate-700 bg-slate-900 p-2.5 shadow-xl text-xs leading-relaxed text-slate-300"
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}
