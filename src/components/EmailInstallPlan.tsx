"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailInstallPlanProps {
  isOpen: boolean;
  onClose: () => void;
  skillSlug?: string;
  installCmd?: string;
}

const STORAGE_KEY = "foragents:email-install-plan";

export function EmailInstallPlan({
  isOpen,
  onClose,
  skillSlug,
  installCmd,
}: EmailInstallPlanProps) {
  const [email, setEmail] = React.useState("");
  const [showToast, setShowToast] = React.useState(false);
  const labelId = React.useId();

  React.useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setShowToast(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Store email in localStorage
    try {
      const data = {
        email: email.trim(),
        timestamp: Date.now(),
        skillSlug,
        installCmd,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to store email:", error);
    }

    // Show success toast
    setShowToast(true);

    // Close modal after brief delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleNoThanks = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-xl border border-cyan/20 bg-card">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan/10 via-transparent to-cyan/10" />

            <div className="relative p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <h2
                id={labelId}
                className="text-lg font-semibold text-white/90 mb-2"
              >
                Get your install plan
              </h2>
              <p className="text-sm text-white/60 mb-6">
                We&apos;ll send you a step-by-step guide to install this skill.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email-input" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan text-black hover:bg-cyan/90 font-semibold"
                  >
                    Send
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNoThanks}
                    variant="outline"
                    className="flex-1 border-white/10 bg-white/5 text-white/70 hover:text-white/90 hover:border-white/20"
                  >
                    No thanks
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-2">
          <div className="rounded-lg border border-cyan/30 bg-card px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-white/90">
              ✓ Email saved! We&apos;ll send your install plan soon.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
