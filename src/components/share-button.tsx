"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  collectionName: string;
  slug: string;
}

export function ShareButton({ collectionName, slug }: ShareButtonProps) {
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/c/${slug}`;
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
      setMenuOpen(false);
    } catch {
      showToast("Copy failed.");
    }
  };

  const shareTwitter = () => {
    const url = `${window.location.origin}/c/${slug}`;
    const text = `Check out "${collectionName}" on forAgents.dev`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
    setMenuOpen(false);
  };

  const downloadCard = async () => {
    try {
      const response = await fetch(`/api/public/collections/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch collection");
      
      const data = await response.json();
      const collectionId = data.collection.id;
      
      const cardUrl = `${window.location.origin}/api/og/stack/${collectionId}`;
      const cardResponse = await fetch(cardUrl);
      if (!cardResponse.ok) throw new Error("Failed to generate card");
      
      const blob = await cardResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${slug}-stack-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      showToast("Card downloaded!");
      setMenuOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Download failed");
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
        📤 Share
      </Button>
      
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-white/10 rounded-lg shadow-lg overflow-hidden z-10">
          <button
            onClick={copyLink}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
          >
            🔗 Copy link
          </button>
          <button
            onClick={shareTwitter}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
          >
            🐦 Share on Twitter
          </button>
          <button
            onClick={downloadCard}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
          >
            📥 Download card
          </button>
        </div>
      )}
      
      {toast && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 text-white text-xs px-3 py-2 rounded-md whitespace-nowrap z-20">
          {toast}
        </div>
      )}
    </div>
  );
}
