import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  triggerStyle?: CSSProperties;
  delay?: number;
}

interface Coords {
  x: number;
  y: number;
}

export function Tooltip({ content, children, side = "top", triggerStyle, delay = 0 }: TooltipProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [actualSide, setActualSide] = useState<"top" | "bottom">(side);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { 
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (showTimer.current) clearTimeout(showTimer.current);
  }, []);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (showTimer.current) clearTimeout(showTimer.current);
    
    const displayTooltip = () => {
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
    };
    
    if (delay > 0) {
      showTimer.current = setTimeout(displayTooltip, delay);
    } else {
      displayTooltip();
    }
  }

  function hide() {
    if (showTimer.current) clearTimeout(showTimer.current);
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
      style={triggerStyle}
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
            className="pointer-events-none rounded shadow-xl text-xs leading-relaxed"
            style={{ 
              ...style, 
              backgroundColor: "#1E1E1E", 
              border: "1px solid #2E2E2E",
              borderRadius: "6px",
              padding: "5px 9px",
              color: "#FFFFFF", 
              fontFamily: "Inter, sans-serif",
              maxWidth: "220px",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}
