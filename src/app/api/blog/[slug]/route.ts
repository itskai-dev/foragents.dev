import { NextResponse } from "next/server";
import { readBlogPosts } from "@/lib/blog";

interface BlogSlugRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: BlogSlugRouteContext) {
  const { slug } = await context.params;
  const posts = await readBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
