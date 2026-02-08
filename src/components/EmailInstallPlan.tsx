"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailInstallPlanProps {
  isOpen: boolean;
  onClose: () => void;
  skillSlug?: string;
  installCmd?: string;
}

export function EmailInstallPlan({
  isOpen,
  onClose,
  skillSlug,
  installCmd,
}: EmailInstallPlanProps) {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address");
      return;
    }

    // Store intent in localStorage for later backend hookup
    const emailIntent = {
      email,
      skillSlug,
      installCmd,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingIntents = localStorage.getItem("emailInstallIntents");
      const intents = existingIntents ? JSON.parse(existingIntents) : [];
      intents.push(emailIntent);
      localStorage.setItem("emailInstallIntents", JSON.stringify(intents));
    } catch (error) {
      console.error("Failed to store email intent:", error);
    }

    showToast("Install plan will be sent to your email");
    setEmail("");
    
    // Close modal after a short delay to show the toast
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div
          ref={modalRef}
          className="bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-w-md w-full p-6 relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-modal-title"
        >
          <h2
            id="email-modal-title"
            className="text-lg font-semibold text-[#F8FAFC] mb-2"
          >
            📧 Send this to my email
          </h2>
          <p className="text-sm text-white/60 mb-4">
            We&apos;ll email you the install command so you can set it up later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                ref={inputRef}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                aria-label="Email address"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-white/10 bg-white/5"
              >
                No thanks
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-cyan text-black hover:bg-cyan/90"
              >
                Send
              </Button>
            </div>
          </form>

          {/* Toast */}
          {toast && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-sm px-4 py-2 rounded-md whitespace-nowrap">
              {toast}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
