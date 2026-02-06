import sanitizeHtml from "sanitize-html";

/**
 * UGC sanitization: strips raw HTML, scripts, iframes, and unsafe URL schemes.
 *
 * Keep the allowlist intentionally small. Add tags/attrs only as needed.
 */
export function sanitizeUserHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["strong", "em", "code", "a"],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
    },
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
    transformTags: {
      a(tagName, attribs) {
        const href = typeof attribs.href === "string" ? attribs.href : "";
        return {
          tagName,
          attribs: {
            href,
            class: attribs.class || "text-cyan hover:underline",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });
}

/**
 * Minimal markdown-lite → HTML for comment lines.
 *
 * IMPORTANT: always sanitize the result.
 */
export function renderCommentLineToHtml(line: string): string {
  let processed = line;

  processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");
  processed = processed.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-[#1A1F2E] font-mono text-[13px]">$1</code>'
  );
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-cyan hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return sanitizeUserHtml(processed);
}
