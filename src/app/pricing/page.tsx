import { PricingContent } from "./pricing-content";

export const metadata = {
  title: "Pricing — forAgents.dev",
  description:
    "Choose the plan that's right for you. Free for casual use, Pro for power users, Enterprise for teams.",
  openGraph: {
    title: "Pricing — forAgents.dev",
    description:
      "Choose the plan that's right for you. Free for casual use, Pro for power users, Enterprise for teams.",
    url: "https://foragents.dev/pricing",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Pricing — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — forAgents.dev",
    description:
      "Choose the plan that's right for you. Free for casual use, Pro for power users, Enterprise for teams.",
    images: ["/api/og"],
  },
};

export default function PricingPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing — forAgents.dev",
    description:
      "Choose the plan that's right for you. Free for casual use, Pro for power users, Enterprise for teams.",
    url: "https://foragents.dev/pricing",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <PricingContent />
    </>
  );
}
