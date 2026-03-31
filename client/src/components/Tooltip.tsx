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
  const [actualSide, setActualSide] = useState<"top" | "bottom">(side);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      
      // Auto-flip to bottom if not enough space on top
      const tooltipHeight = 200; // approximate max height with padding
      const spaceAbove = r.top;
      
      let finalSide = side;
      if (side === "top" && spaceAbove < tooltipHeight) {
        // Not enough space above, flip to bottom
        finalSide = "bottom";
      }
      
      setActualSide(finalSide);
      setCoords({ x: r.left + r.width / 2, y: finalSide === "bottom" ? r.bottom : r.top });
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
        ...(actualSide === "bottom"
          ? { top: coords.y + 8 }
          : { top: coords.y - 8, transform: "translateX(-50%) translateY(-100%)" }),
        ...(actualSide === "bottom" ? { transform: "translateX(-50%)" } : {}),
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
            className="pointer-events-none w-56 rounded p-2.5 shadow-xl text-xs leading-relaxed"
            style={{ 
              ...style, 
              backgroundColor: "#1A1A1A", 
              border: "1px solid #333333", 
              color: "#FFFFFF", 
              fontFamily: "Inter, sans-serif" 
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}
