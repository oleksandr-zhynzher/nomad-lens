import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

import { useTooltipBehavior } from "./Tooltip.utils";

interface TooltipProps {
  readonly content: ReactNode;
  readonly children: ReactNode;
  readonly side?: "top" | "bottom";
  readonly triggerStyle?: CSSProperties;
  readonly delay?: number;
}

export function Tooltip({
  content,
  children,
  side = "top",
  triggerStyle,
  delay = 0,
}: TooltipProps) {
  const { triggerRef, coords, style, show, hide } = useTooltipBehavior(side, delay);

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      style={triggerStyle}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      role="presentation"
    >
      {children}
      {coords === null
        ? null
        : createPortal(
            <div
              role="tooltip"
              className="pointer-events-none max-w-[220px] rounded-[6px] border border-[#2E2E2E] bg-surface px-[9px] py-[5px] text-xs leading-relaxed text-white shadow-xl"
              style={style}
            >
              {content}
            </div>,
            document.body,
          )}
    </span>
  );
}
