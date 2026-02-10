import { promises as fs } from "fs";
import path from "path";

export type BlogPost = {
  title: string;
  slug: string;
  content: string; // markdown
  author: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  excerpt: string;
  readingTime: string;
};

export type BlogListResponse = {
  posts: BlogPost[];
  total: number;
};

const BLOG_POSTS_PATH = path.join(process.cwd(), "data", "blog-posts.json");

export async function readBlogPosts(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(BLOG_POSTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as BlogPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeBlogPosts(posts: BlogPost[]): Promise<void> {
  await fs.mkdir(path.dirname(BLOG_POSTS_PATH), { recursive: true });
  await fs.writeFile(BLOG_POSTS_PATH, JSON.stringify(posts, null, 2));
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_>#-]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerpt(markdown: string, maxLength = 160): string {
  const text = stripMarkdown(markdown);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function estimateReadingTime(markdown: string): string {
  const wordCount = stripMarkdown(markdown).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function filterAndSortPosts(
  posts: BlogPost[],
  opts: { search?: string; tag?: string; sort?: string }
): BlogPost[] {
  const search = opts.search?.trim().toLowerCase();
  const tag = opts.tag?.trim().toLowerCase();

  let filtered = posts;

  if (search) {
    filtered = filtered.filter((post) => {
      const haystack = [post.title, post.excerpt, post.content, post.author, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (tag) {
    filtered = filtered.filter((post) => post.tags.some((t) => t.toLowerCase() === tag));
  }

  if (opts.sort === "recent") {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  return filtered;
}
