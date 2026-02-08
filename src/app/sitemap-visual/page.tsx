import Link from "next/link";

export const metadata = {
  title: "Visual Sitemap — forAgents.dev",
  description: "Complete site index showing all pages organized by category.",
  openGraph: {
    title: "Visual Sitemap — forAgents.dev",
    description: "Complete site index showing all pages organized by category.",
    url: "https://foragents.dev/sitemap-visual",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const categories = [
  {
    name: "Main",
    icon: "🏠",
    pages: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Press", href: "/press" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    name: "Products",
    icon: "🛠️",
    pages: [
      { name: "Skills", href: "/skills" },
      { name: "Collections", href: "/collections" },
      { name: "Trending", href: "/trending" },
      { name: "Compare", href: "/compare" },
      { name: "Search", href: "/search" },
    ],
  },
  {
    name: "Learn",
    icon: "📚",
    pages: [
      { name: "Get Started", href: "/get-started" },
      { name: "Resources", href: "/resources" },
      { name: "Glossary", href: "/glossary" },
      { name: "Learn", href: "/learn" },
      { name: "Guides", href: "/guides" },
      { name: "Demos", href: "/use-cases" },
      { name: "Use Cases", href: "/use-cases" },
    ],
  },
  {
    name: "Community",
    icon: "👥",
    pages: [
      { name: "Community", href: "/community" },
      { name: "Showcase", href: "/showcase" },
      { name: "Events", href: "/events" },
      { name: "Testimonials", href: "/testimonials" },
      { name: "Open Source", href: "/open-source" },
    ],
  },
  {
    name: "Business",
    icon: "💼",
    pages: [
      { name: "Pricing", href: "/pricing" },
      { name: "Enterprise", href: "/enterprise" },
      { name: "Partners", href: "/partners" },
      { name: "Brand", href: "/brand" },
    ],
  },
  {
    name: "Support",
    icon: "🛟",
    pages: [
      { name: "Support", href: "/support" },
      { name: "FAQ", href: "/faq" },
      { name: "Security", href: "/security" },
      { name: "Accessibility", href: "/accessibility" },
      { name: "Status", href: "/status" },
    ],
  },
  {
    name: "Legal",
    icon: "⚖️",
    pages: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Governance", href: "/acp" },
    ],
  },
  {
    name: "Updates",
    icon: "📰",
    pages: [
      { name: "Changelog", href: "/changelog" },
      { name: "What&apos;s New", href: "/whats-new" },
      { name: "Updates", href: "/updates" },
      { name: "Blog", href: "/blog" },
      { name: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    name: "Developers",
    icon: "💻",
    pages: [
      { name: "Docs/API", href: "/docs" },
      { name: "Playground", href: "/playground" },
      { name: "Feeds", href: "/feeds" },
      { name: "Migrate", href: "/migrate" },
    ],
  },
];

export default function SitemapVisualPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] text-sm font-medium mb-6">
            <span>🗺️</span>
            <span>Site Index</span>
          </div>
          
          <h1 className="text-[36px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Visual Sitemap
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Complete directory of all pages on forAgents.dev, organized by category for easy navigation.
          </p>
        </div>
      </section>

      {/* Sitemap Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/30 transition-all group"
            >
              {/* Hover effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-xl font-bold text-foreground">
                    {category.name}
                  </h2>
                </div>

                {/* Pages List */}
                <ul className="space-y-2">
                  {category.pages.map((page) => (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#06D6A0] transition-colors group/link"
                      >
                        <span className="text-[#06D6A0]/50 group-hover/link:text-[#06D6A0] transition-colors">
                          →
                        </span>
                        <span>{page.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 px-6 py-4 rounded-xl bg-card/30 border border-white/10">
            <p className="text-sm text-muted-foreground">
              Looking for the XML sitemap?
            </p>
            <a
              href="/sitemap.xml"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30 text-[#06D6A0] text-sm font-medium hover:bg-[#06D6A0]/20 transition-colors"
            >
              View sitemap.xml →
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
