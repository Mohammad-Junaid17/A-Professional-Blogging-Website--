"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/** Strip Microsoft Word / Office HTML artifacts from pasted content */
function stripWordHtml(content: string): string {
  return content
    // Remove <!-- ... --> comments (Word XML/MSO comments)
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove <style>...</style> blocks (Word CSS)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove <script>...</script> blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    // Remove Word XML processing instructions and namespaced tags
    .replace(/<\/?(?:o|w|m|v):[^>]*>/gi, "")
    // Remove all remaining HTML tags but keep their text content
    .replace(/<[^>]+>/g, "")
    // Collapse runs of blank lines (> 2) to at most 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function MarkdownRenderer({ 
  content, 
  className = "", 
  style = {} 
}: { 
  content: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Detect Word content via MSO markers
  const hasWordHtml = /mso-|MsoNormal|<o:|<w:|<!--\[if/i.test(content);

  let cleaned = content;

  if (hasWordHtml) {
    if (/<[a-z]/i.test(content)) {
      // Case 1: actual HTML tags with Word styles — strip all tags
      cleaned = content
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<\/?(?:o|w|m|v):[^>]*>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } else {
      // Case 2: plain-text Word metadata — cut everything up to last CSS closing brace
      const msoBlockEnd = content.lastIndexOf("}");
      if (msoBlockEnd !== -1) {
        const real = content.substring(msoBlockEnd + 1).trimStart();
        if (real.length > 50) cleaned = real;
      }
    }
  }

  return (
    <div 
      className={`prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif text-foreground prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground ${className}`}
      style={style}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
