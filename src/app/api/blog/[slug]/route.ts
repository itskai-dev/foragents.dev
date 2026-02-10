import { NextRequest, NextResponse } from "next/server";
import { buildExcerpt, estimateReadingTime, readBlogPosts, writeBlogPosts } from "@/lib/blog";

interface BlogSlugRouteContext {
  params: Promise<{ slug: string }>;
}

type UpdateBlogRequest = {
  title?: unknown;
  content?: unknown;
  author?: unknown;
  tags?: unknown;
  excerpt?: unknown;
};

function validatePatch(body: UpdateBlogRequest): string[] {
  const errors: string[] = [];

  if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) {
    errors.push("title must be a non-empty string");
  }

  if (body.content !== undefined && (typeof body.content !== "string" || !body.content.trim())) {
    errors.push("content must be a non-empty string");
  }

  if (body.author !== undefined && (typeof body.author !== "string" || !body.author.trim())) {
    errors.push("author must be a non-empty string");
  }

  if (body.tags !== undefined && (!Array.isArray(body.tags) || !body.tags.every((tag) => typeof tag === "string"))) {
    errors.push("tags must be a string array");
  }

  if (body.excerpt !== undefined && typeof body.excerpt !== "string") {
    errors.push("excerpt must be a string");
  }

  return errors;
}

export async function GET(_request: NextRequest, context: BlogSlugRouteContext) {
  const { slug } = await context.params;
  const posts = await readBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, context: BlogSlugRouteContext) {
  const { slug } = await context.params;

  try {
    const body = (await request.json()) as UpdateBlogRequest;
    const errors = validatePatch(body);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const posts = await readBlogPosts();
    const index = posts.findIndex((post) => post.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = posts[index];
    const updatedContent = body.content !== undefined ? (body.content as string).trim() : existing.content;

    const updatedPost = {
      ...existing,
      title: body.title !== undefined ? (body.title as string).trim() : existing.title,
      content: updatedContent,
      author: body.author !== undefined ? (body.author as string).trim() : existing.author,
      tags:
        body.tags !== undefined
          ? (body.tags as string[]).map((tag) => tag.trim()).filter(Boolean)
          : existing.tags,
      excerpt:
        body.excerpt !== undefined
          ? (body.excerpt as string).trim() || buildExcerpt(updatedContent)
          : body.content !== undefined
            ? buildExcerpt(updatedContent)
            : existing.excerpt,
      readingTime: estimateReadingTime(updatedContent),
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    await writeBlogPosts(posts);

    return NextResponse.json(updatedPost);
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function POST(_request: NextRequest, context: BlogSlugRouteContext) {
  const { slug } = await context.params;
  const posts = await readBlogPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  posts[index] = {
    ...posts[index],
    viewCount: posts[index].viewCount + 1,
  };

  await writeBlogPosts(posts);

  return NextResponse.json({ slug: posts[index].slug, viewCount: posts[index].viewCount });
}
