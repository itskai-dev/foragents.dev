import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown
  author: string;
  tags: string[];
  excerpt: string;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
};

export type BlogListResponse = {
  posts: BlogPost[];
  total: number;
};

const BLOG_POSTS_PATH = path.join(process.cwd(), "data", "blog-posts.json");

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

function normalizePost(post: Partial<BlogPost>): BlogPost {
  const content = typeof post.content === "string" ? post.content : "";
  const publishedAt =
    typeof post.publishedAt === "string" && post.publishedAt ? post.publishedAt : new Date().toISOString();
  const updatedAt =
    typeof post.updatedAt === "string" && post.updatedAt ? post.updatedAt : publishedAt;
  const slug = typeof post.slug === "string" && post.slug ? post.slug : "untitled-post";

  return {
    id: typeof post.id === "string" && post.id ? post.id : slug || randomUUID(),
    title: typeof post.title === "string" ? post.title : "Untitled Post",
    slug,
    content,
    author: typeof post.author === "string" ? post.author : "Unknown",
    tags: Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === "string") : [],
    excerpt: typeof post.excerpt === "string" && post.excerpt ? post.excerpt : buildExcerpt(content),
    viewCount: typeof post.viewCount === "number" ? post.viewCount : 0,
    publishedAt,
    updatedAt,
    readingTime:
      typeof post.readingTime === "string" && post.readingTime ? post.readingTime : estimateReadingTime(content),
  };
}

export async function readBlogPosts(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(BLOG_POSTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((post) => normalizePost(post as Partial<BlogPost>))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch {
    return [];
  }
}

export async function writeBlogPosts(posts: BlogPost[]): Promise<void> {
  await fs.mkdir(path.dirname(BLOG_POSTS_PATH), { recursive: true });
  await fs.writeFile(BLOG_POSTS_PATH, JSON.stringify(posts, null, 2));
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

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
