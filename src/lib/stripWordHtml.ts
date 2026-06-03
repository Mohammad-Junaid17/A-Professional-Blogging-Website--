/**
 * Strips Microsoft Word / Office HTML artifacts from pasted content.
 * Runs server-side before saving to the database so the DB always
 * contains clean text/markdown.
 */
export function stripWordHtml(content: string): string {
  if (!content) return content;

  // Case 1: Real HTML with Word tags (<style>, <o:p>, etc.)
  const hasWordHtml = /mso-|MsoNormal|<o:|<w:|<!--\[if/i.test(content);
  if (hasWordHtml && /<[a-z]/i.test(content)) {
    return content
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<\/?(?:o|w|m|v):[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Case 2: Word XML pasted as plain text (no HTML tags, but mso- CSS appears as text)
  // The metadata block ends with the last `}` of the CSS; real content follows.
  if (hasWordHtml) {
    const msoBlockEnd = content.lastIndexOf('}');
    if (msoBlockEnd !== -1) {
      const realContent = content.substring(msoBlockEnd + 1).trimStart();
      if (realContent.length > 50) return realContent;
    }
  }

  return content;
}
