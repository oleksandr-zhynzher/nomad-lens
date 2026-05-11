import { useCallback, useRef, useState } from "react";

const COPIED_RESET_DELAY_MS = 3000;

function fallbackCopyText(text: string): boolean {
  const element = document.createElement("textarea");
  element.value = text;
  element.setAttribute("readonly", "");
  element.style.cssText = "position:fixed;left:-9999px;top:0";

  document.body.appendChild(element);
  element.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(element);
  }
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // The fallback below covers browsers that expose Clipboard API but block it.
    }
  }

  if (!fallbackCopyText(text)) {
    throw new Error("Unable to copy text to clipboard");
  }
}

export function useClipboard(resetDelayMs = COPIED_RESET_DELAY_MS) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }

      try {
        await copyTextToClipboard(text);
        setCopied(true);
        setError(null);
        resetTimerRef.current = window.setTimeout(() => {
          setCopied(false);
          resetTimerRef.current = null;
        }, resetDelayMs);
        return true;
      } catch (caught) {
        const nextError =
          caught instanceof Error ? caught : new Error("Unable to copy text to clipboard");
        setCopied(false);
        setError(nextError);
        return false;
      }
    },
    [resetDelayMs],
  );

  return { copied, error, copy };
}
