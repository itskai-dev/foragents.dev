import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { PricingClient } from "./pricing-client";

export const metadata = {
  title: "Pricing — forAgents.dev",
  description: "Upgrade to forAgents.dev Premium.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </Link>
          <MobileNav />
        </div>
      </header>

      <PricingClient />

      <Footer />
    </div>
  );
}
