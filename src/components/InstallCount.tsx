"use client";

import * as React from "react";

type Props = {
  skillSlug: string;
  className?: string;
};

export function InstallCount({ skillSlug, className = "" }: Props) {
  const [count, setCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch(
          `/api/track/install?slug=${encodeURIComponent(skillSlug)}`
        );
        if (response.ok) {
          const data = await response.json();
          setCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch install count:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [skillSlug]);

  if (loading || count === null) {
    return null;
  }

  if (count === 0) {
    return null;
  }

  return (
    <span className={className}>
      {count.toLocaleString()} {count === 1 ? "install" : "installs"}
    </span>
  );
}
