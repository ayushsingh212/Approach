/**
 * Strip emoji characters from a string.
 * This is used for real-time sanitization of frontend inputs.
 */
export function stripEmojis(text: string): string {
  // Using a broad Unicode range regex for Emoji sections
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
}

/**
 * Truncate text with ellipsis if it exceeds the limit.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
