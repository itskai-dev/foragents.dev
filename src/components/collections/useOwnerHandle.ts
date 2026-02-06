"use client";

import { useEffect, useState } from "react";
import { normalizeOwnerHandle } from "@/lib/collections";

const KEY = "fa_owner_handle";

export function useOwnerHandle() {
  const [ownerHandle, setOwnerHandle] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) || "";
      setOwnerHandle(stored);
    } finally {
      setReady(true);
    }
  }, []);

  function save(next: string) {
    const normalized = normalizeOwnerHandle(next) || "";
    setOwnerHandle(normalized);
    if (typeof window !== "undefined") {
      if (normalized) window.localStorage.setItem(KEY, normalized);
      else window.localStorage.removeItem(KEY);
    }
  }

  return { ownerHandle, setOwnerHandle: save, ready };
}
