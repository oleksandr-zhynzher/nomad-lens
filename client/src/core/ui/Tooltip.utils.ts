import { type CSSProperties, useEffect, useRef, useState } from "react";

interface Coords {
  x: number;
  y: number;
}

export interface TooltipBehavior {
  triggerRef: React.RefObject<HTMLSpanElement | null>;
  coords: Coords | null;
  style: CSSProperties;
  show: () => void;
  hide: () => void;
}

export function useTooltipBehavior(side: "top" | "bottom", delay: number): TooltipBehavior {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [actualSide, setActualSide] = useState<"top" | "bottom">(side);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
      if (showTimer.current !== null) clearTimeout(showTimer.current);
    },
    [],
  );

  function displayTooltip() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const tooltipHeight = 200;
    let finalSide = side;
    if (side === "top" && r.top < tooltipHeight) finalSide = "bottom";
    setActualSide(finalSide);
    setCoords({ x: r.left + r.width / 2, y: finalSide === "bottom" ? r.bottom : r.top });
  }

  function show() {
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    if (showTimer.current !== null) clearTimeout(showTimer.current);
    if (delay > 0) {
      showTimer.current = setTimeout(displayTooltip, delay);
    } else {
      displayTooltip();
    }
  }

  function hide() {
    if (showTimer.current !== null) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      setCoords(null);
    }, 120);
  }

  const style: CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.x,
        zIndex: 9999,
        ...(actualSide === "bottom"
          ? { top: coords.y + 8, transform: "translateX(-50%)" }
          : { top: coords.y - 8, transform: "translateX(-50%) translateY(-100%)" }),
      }
    : {};

  return { triggerRef, coords, style, show, hide };
}
