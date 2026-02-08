"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan/5 via-card/80 to-purple/5 p-6 md:p-8">
      {/* Subtle glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-[60px]" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple/10 rounded-full blur-[40px]" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📬</span>
          <h3 className="text-xl font-bold">Stay Updated</h3>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">
          Get weekly updates on new skills and agent tools
        </p>

        {submitted ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-500 font-medium">
              ✓ Thanks for subscribing! We&apos;ll keep you updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-cyan text-[#0A0E17] hover:brightness-110 font-semibold"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
