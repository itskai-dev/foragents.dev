"use client";

import { Button } from "@/components/ui/button";

interface BlogErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error: _error, reset }: BlogErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We couldn&apos;t load the blog right now. Please try again.</p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
