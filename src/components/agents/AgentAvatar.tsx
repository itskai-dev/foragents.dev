"use client";

import { useEffect, useState } from "react";

type AgentJson = {
  name: string;
  avatar?: string;
};

function isProbablyUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

export function AgentAvatar({ handle, fallback }: { handle: string; fallback: string }) {
  const [avatar, setAvatar] = useState<string>(fallback);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(`/api/agents/${encodeURIComponent(handle)}/agent-json`, {
          cache: "force-cache",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { agentJson: AgentJson | null };
        const a = data?.agentJson?.avatar;
        if (!a || typeof a !== "string") return;
        if (!cancelled) setAvatar(a);
      } catch {
        // ignore
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (isProbablyUrl(avatar)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={`${handle} avatar`}
        width={80}
        height={80}
        className="rounded-xl border border-white/10"
      />
    );
  }

  return <div className="text-6xl leading-none">{avatar}</div>;
}
