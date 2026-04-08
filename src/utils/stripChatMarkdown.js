/**
 * Strips markdown the model often emits (**bold**, *italic*, stray **) so chat shows
 * plain text + emoji (✅❌👍🔥) without ugly asterisks.
 */
export function stripChatMarkdown(text) {
  if (text == null || typeof text !== "string") return "";
  let t = text;

  for (let i = 0; i < 12; i++) {
    const next = t.replace(/\*\*([^*]+)\*\*/g, "$1");
    if (next === t) break;
    t = next;
  }

  t = t.replace(/\*\*/g, "");

  t = t.replace(/(^|[\s\n])\*([^*\n]+)\*([\s\n]|$)/g, "$1$2$3");

  t = t.replace(/_([^_\n]+)_/g, "$1");

  t = t.replace(/^(\s*)\*\s+/gm, "$1");

  return t;
}
