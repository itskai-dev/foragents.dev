import { renderCommentLineToHtml, sanitizeUserHtml } from "@/lib/sanitize";

describe("UGC sanitizer", () => {
  test("strips scripts/iframes and dangerous tags", () => {
    const dirty = '<script>alert(1)</script><iframe src="https://evil.com"></iframe><strong>ok</strong>';
    const clean = sanitizeUserHtml(dirty);
    expect(clean).toContain("<strong>ok</strong>");
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("<iframe");
    expect(clean).not.toContain("evil.com");
  });

  test("removes javascript: URLs from links", () => {
    const html = renderCommentLineToHtml('[x](javascript:alert(1))');
    // sanitize-html drops/strips unsafe schemes
    expect(html).toContain("<a");
    expect(html).not.toContain("javascript:");
  });

  test("does not allow raw HTML injection", () => {
    const html = renderCommentLineToHtml('<img src=x onerror=alert(1)>hello');
    expect(html).toContain("hello");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("onerror");
  });
});
