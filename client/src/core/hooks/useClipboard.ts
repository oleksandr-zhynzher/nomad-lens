export async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Unable to copy text to clipboard");
  }
  await navigator.clipboard.writeText(text);
}
