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
