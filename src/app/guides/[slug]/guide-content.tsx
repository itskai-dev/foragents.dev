"use client";

interface GuideContentProps {
  markdown: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(value: string): string {
  if (value.startsWith("/") || value.startsWith("#")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return parsed.toString();
    }
  } catch {
    return "#";
  }

  return "#";
}

function renderInline(markdown: string): string {
  let output = escapeHtml(markdown);

  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, url: string) => {
    const safeUrl = sanitizeUrl(url.trim());
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer">${text}</a>`;
  });

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return output;
}

function markdownToHtml(markdown: string): string {
  const blocks = markdown.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const firstLine = lines[0];

      if (firstLine.startsWith("### ")) {
        return `<h3>${renderInline(firstLine.slice(4))}</h3>`;
      }

      if (firstLine.startsWith("## ")) {
        return `<h2>${renderInline(firstLine.slice(3))}</h2>`;
      }

      if (firstLine.startsWith("# ")) {
        return `<h1>${renderInline(firstLine.slice(2))}</h1>`;
      }

      if (block.startsWith("```") && block.endsWith("```")) {
        const code = block.replace(/^```[a-zA-Z0-9-]*\n?/, "").replace(/```$/, "");
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
      }

      const unorderedItems = lines.filter((line) => /^[-*]\s+/.test(line));
      if (unorderedItems.length === lines.length) {
        const items = unorderedItems
          .map((line) => line.replace(/^[-*]\s+/, ""))
          .map((line) => `<li>${renderInline(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      const orderedItems = lines.filter((line) => /^\d+\.\s+/.test(line));
      if (orderedItems.length === lines.length) {
        const items = orderedItems
          .map((line) => line.replace(/^\d+\.\s+/, ""))
          .map((line) => `<li>${renderInline(line)}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }

      return `<p>${renderInline(block.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");
}

export function GuideContent({ markdown }: GuideContentProps) {
  return (
    <div
      className="prose prose-invert prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
    />
  );
}
