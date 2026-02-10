"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlogPostErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogPostError({ error: _error, reset }: BlogPostErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Couldn&apos;t load this post</h2>
        <p className="text-muted-foreground mb-6">Try reloading, or head back to the blog list.</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Retry</Button>
          <Button asChild variant="outline" className="border-white/10">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
