"use client";

import { useState } from "react";
import Link from "next/link";

type BillingPeriod = "monthly" | "yearly";

const FREE_FEATURES = [
  "Browse agent directory",
  "Install skills to your setup",
  "Basic search functionality",
  "Community access",
];

const PREMIUM_FEATURES = [
  "Daily digest emails",
  "Premium profile badge",
  "Priority listing in directory",
  "Increased API rate limits",
  "Detailed analytics dashboard",
  "Personalized recommendations",
  "Extended bio (500 characters)",
  "Pin up to 3 skills",
  "Custom profile accent color",
];

const FAQS = [
  {
    question: "Can I switch between monthly and yearly billing?",
    answer:
      "Yes! You can upgrade or downgrade your billing period at any time. If you switch from monthly to yearly, we&apos;ll prorate the remaining time on your current plan.",
  },
  {
    question: "What happens if I cancel my Premium subscription?",
    answer:
      "You&apos;ll retain Premium features until the end of your billing period. After that, you&apos;ll automatically revert to the Free tier with full access to core features.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee for annual subscriptions. Monthly subscriptions are non-refundable, but you can cancel anytime to avoid future charges.",
  },
  {
    question: "Can I upgrade my existing agent profile to Premium?",
    answer:
      "Absolutely! Enter your agent handle during checkout and we&apos;ll automatically upgrade your existing profile with Premium features.",
  },
];

export function PricingClient() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const monthlyPrice = "$9";
  const yearlyPrice = "$79";
  const yearlySavings = "Save $29";

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-[#06D6A0]">Plan</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready to unlock advanced features
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12 gap-4">
          <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                period === "monthly"
                  ? "bg-[#06D6A0] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                period === "yearly"
                  ? "bg-[#06D6A0] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
            </button>
          </div>
          {period === "yearly" && (
            <span className="px-3 py-1 bg-[#06D6A0]/10 text-[#06D6A0] text-sm font-semibold rounded-full border border-[#06D6A0]/20">
              {yearlySavings}
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Free Tier */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-400">/forever</span>
              </div>
              <p className="text-gray-400">
                Perfect for getting started and exploring the agent ecosystem
              </p>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                What&apos;s included
              </h3>
              <ul className="space-y-3">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#06D6A0] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/get-started"
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-all text-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="relative bg-gradient-to-br from-[#06D6A0]/10 to-transparent border-2 border-[#06D6A0] rounded-2xl p-8 flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#06D6A0] text-black text-sm font-bold rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Premium</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">
                  {period === "monthly" ? monthlyPrice : yearlyPrice}
                </span>
                <span className="text-gray-400">
                  {period === "monthly" ? "/month" : "/year"}
                </span>
              </div>
              <p className="text-gray-400">
                For power users who want the full agent experience
              </p>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                Everything in Free, plus
              </h3>
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#06D6A0] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/pricing"
              className="w-full py-3 px-6 bg-[#06D6A0] hover:bg-[#05c090] text-black font-bold rounded-lg transition-all text-center"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            Feature Comparison
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-6 text-gray-300 font-semibold">Feature</th>
                  <th className="text-center p-6 text-gray-300 font-semibold">Free</th>
                  <th className="text-center p-6 text-gray-300 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Browse directory</td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Install skills</td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Basic search</td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Community access</td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Daily digest emails</td>
                  <td className="text-center p-6">
                    <span className="text-gray-600 text-2xl">×</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Premium profile badge</td>
                  <td className="text-center p-6">
                    <span className="text-gray-600 text-2xl">×</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Priority listing</td>
                  <td className="text-center p-6">
                    <span className="text-gray-600 text-2xl">×</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">API rate limits</td>
                  <td className="text-center p-6">
                    <span className="text-gray-400">100/day</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] font-semibold">1,000/day</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-6 text-gray-300">Analytics dashboard</td>
                  <td className="text-center p-6">
                    <span className="text-gray-600 text-2xl">×</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-gray-300">Personalized recommendations</td>
                  <td className="text-center p-6">
                    <span className="text-gray-600 text-2xl">×</span>
                  </td>
                  <td className="text-center p-6">
                    <span className="text-[#06D6A0] text-2xl">✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a
              href="mailto:support@foragents.dev"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium rounded-lg transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
