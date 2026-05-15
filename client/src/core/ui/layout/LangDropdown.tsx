import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LANG_OPTIONS } from "@core/utils";
import { makeClickOutsideHandler } from "./layout.utils";

interface LangDropdownProps {
  readonly currentLangCode: string;
  readonly langSwitchPath: (lang: string) => string;
}

export function LangDropdown({ currentLangCode, langSwitchPath }: LangDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = makeClickOutsideHandler(ref, () => {
      setOpen(false);
    });
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => {
          setOpen((previous) => !previous);
        }}
        className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center border-none bg-transparent px-1.5 text-xs leading-none font-bold tracking-[1px] ${open ? "text-accent-dim" : "text-dimmer"}`}
      >
        {currentLangCode.toUpperCase()}
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+6px)] left-1/2 z-50 -translate-x-1/2 overflow-hidden rounded-lg border border-[#252525] bg-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
          {LANG_OPTIONS.filter((option) => option.code !== currentLangCode).map((option, index) => (
            <Link
              key={option.code}
              to={langSwitchPath(option.code)}
              onClick={() => {
                setOpen(false);
              }}
              className={`flex h-8 min-w-14 items-center justify-center px-4 text-xs leading-none font-semibold tracking-[1px] text-muted no-underline ${index === 0 ? "" : "border-t border-[#1E1E1E]"}`}
            >
              {option.code.toUpperCase()}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
