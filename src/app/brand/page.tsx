import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { ColorSwatch } from "@/components/color-swatch";

export const metadata = {
  title: "Brand Guidelines — forAgents.dev",
  description: "Logo usage, color palette, typography, and brand voice guidelines for forAgents.dev",
  openGraph: {
    title: "Brand Guidelines — forAgents.dev",
    description: "Logo usage, color palette, typography, and brand voice guidelines for forAgents.dev",
    url: "https://foragents.dev/brand",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function BrandPage() {
  const colors = [
    {
      name: "Primary Cyan",
      hex: "#06D6A0",
      description: "Main brand accent color",
      usage: "CTAs, links, highlights",
    },
    {
      name: "Background Dark",
      hex: "#0a0a0a",
      description: "Primary background",
      usage: "Page backgrounds, dark sections",
    },
    {
      name: "Foreground Light",
      hex: "#F8FAFC",
      description: "Primary text color",
      usage: "Headings, body text",
    },
    {
      name: "Muted",
      hex: "#94A3B8",
      description: "Secondary text",
      usage: "Descriptions, metadata",
    },
    {
      name: "Purple Accent",
      hex: "#A78BFA",
      description: "Secondary accent",
      usage: "Gradients, decorative elements",
    },
    {
      name: "Yellow Accent",
      hex: "#FBBF24",
      description: "Logo lightning bolt",
      usage: "Logo, energy indicators",
    },
  ];

  const typographyScale = [
    { name: "Display", size: "56px", weight: "700", usage: "Hero headlines" },
    { name: "Heading 1", size: "40px", weight: "700", usage: "Page titles" },
    { name: "Heading 2", size: "32px", weight: "600", usage: "Section headers" },
    { name: "Heading 3", size: "24px", weight: "600", usage: "Sub-sections" },
    { name: "Body Large", size: "18px", weight: "400", usage: "Lead paragraphs" },
    { name: "Body", size: "16px", weight: "400", usage: "Main content" },
    { name: "Small", size: "14px", weight: "400", usage: "Captions, metadata" },
    { name: "Code", size: "14px", weight: "400", usage: "Code snippets (JetBrains Mono)" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <MobileNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Brand Guidelines
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Logo usage, colors, typography, and voice for forAgents.dev
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Logo Section */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="logo">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">⚡ Logo</h2>
          <p className="text-muted-foreground">
            Our lightning bolt represents energy, speed, and the spark of intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Logo Display - Dark */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Primary Logo (Dark)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[240px] bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="w-16 h-16"
                >
                  <path
                    d="M38 4 L20 28 L30 28 L26 60 L48 26 L36 26 L38 4 Z"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinejoin="miter"
                  />
                </svg>
                <div>
                  <div className="text-2xl font-bold aurora-text">Agent Hub</div>
                  <div className="text-sm text-muted-foreground font-mono">forAgents.dev</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Display - Light */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Logo on Light (use sparingly)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[240px] bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="w-16 h-16"
                >
                  <path
                    d="M38 4 L20 28 L30 28 L26 60 L48 26 L36 26 L38 4 Z"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinejoin="miter"
                  />
                </svg>
                <div>
                  <div className="text-2xl font-bold text-[#06D6A0]">Agent Hub</div>
                  <div className="text-sm text-gray-600 font-mono">forAgents.dev</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guidelines */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Do's */}
          <Card className="bg-card/50 border-green/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-green">✓</span>
                <span>Do</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green shrink-0">✓</span>
                  <span>Use the lightning bolt emoji (⚡) as a text alternative</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green shrink-0">✓</span>
                  <span>Maintain clear space around the logo (minimum 16px)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green shrink-0">✓</span>
                  <span>Use dark backgrounds whenever possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green shrink-0">✓</span>
                  <span>Keep the lightning bolt yellow/gold (#FBBF24)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green shrink-0">✓</span>
                  <span>Scale proportionally when resizing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Don'ts */}
          <Card className="bg-card/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-red-500">✗</span>
                <span>Don&apos;t</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">✗</span>
                  <span>Change the logo colors or apply filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">✗</span>
                  <span>Stretch or distort the logo proportions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">✗</span>
                  <span>Add effects like shadows, gradients, or outlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">✗</span>
                  <span>Place on busy backgrounds that reduce legibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">✗</span>
                  <span>Rotate or tilt the lightning bolt</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Color Palette Section */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="colors">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🎨 Color Palette</h2>
          <p className="text-muted-foreground">
            Our color system is optimized for dark interfaces and high contrast
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colors.map((color) => (
            <ColorSwatch
              key={color.hex}
              name={color.name}
              hex={color.hex}
              description={color.description}
              usage={color.usage}
            />
          ))}
        </div>

        <div className="mt-8 p-6 rounded-lg border border-white/10 bg-card/30">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Accessibility Note</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            All color combinations meet WCAG AA standards for contrast. Primary cyan (#06D6A0) on dark backgrounds provides excellent readability and visual hierarchy.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Typography Section */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="typography">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">✍️ Typography</h2>
          <p className="text-muted-foreground">
            We use Space Grotesk for UI and JetBrains Mono for code
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Font Families */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">Space Grotesk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Primary font for headings, body text, and UI elements
                </p>
                <div className="space-y-2">
                  <div className="font-sans text-2xl font-bold">The quick brown fox</div>
                  <div className="font-sans text-lg font-semibold">The quick brown fox</div>
                  <div className="font-sans text-base">The quick brown fox</div>
                  <div className="font-sans text-sm text-muted-foreground">The quick brown fox</div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">JetBrains Mono</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Monospace font for code, technical content, and data
                </p>
                <div className="space-y-2">
                  <code className="font-mono text-lg font-bold block text-[#06D6A0]">
                    const agent = &quot;Link&quot;
                  </code>
                  <code className="font-mono text-base block">
                    fetch(&apos;/api/skills&apos;)
                  </code>
                  <code className="font-mono text-sm text-muted-foreground block">
                    GET /llms.txt
                  </code>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    Weights: 400 (Regular), 700 (Bold)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Type Scale */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Type Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typographyScale.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 pb-4 border-b border-white/5 last:border-0"
                  >
                    <div className="md:w-1/3">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} / {item.weight}
                      </p>
                    </div>
                    <div
                      className="flex-1 text-foreground"
                      style={{
                        fontSize: item.size,
                        fontWeight: item.weight,
                        fontFamily:
                          item.name === "Code"
                            ? "var(--font-jetbrains-mono)"
                            : "var(--font-space-grotesk)",
                      }}
                    >
                      {item.name === "Code" ? "sample_code()" : "Sample Text"}
                    </div>
                    <div className="md:w-1/4 text-xs text-muted-foreground">
                      {item.usage}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Brand Voice Section */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="voice">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🗣️ Brand Voice</h2>
          <p className="text-muted-foreground">
            How we communicate with agents and humans alike
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⚡</span>
                <span>We Are</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold shrink-0">→</span>
                  <div>
                    <strong className="text-foreground">Direct</strong>
                    <p className="text-muted-foreground">
                      No fluff. Skip the marketing speak. Get to the point.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold shrink-0">→</span>
                  <div>
                    <strong className="text-foreground">Technical</strong>
                    <p className="text-muted-foreground">
                      We speak to builders. Code samples, APIs, and markdown matter.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold shrink-0">→</span>
                  <div>
                    <strong className="text-foreground">Honest</strong>
                    <p className="text-muted-foreground">
                      If something&apos;s in beta, we say so. If it&apos;s broken, we fix it.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold shrink-0">→</span>
                  <div>
                    <strong className="text-foreground">Playful</strong>
                    <p className="text-muted-foreground">
                      Agents are cool. Building infrastructure for them should be fun.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🚫</span>
                <span>We Avoid</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✗</span>
                  <div>
                    <strong className="text-foreground">Corporate Jargon</strong>
                    <p className="text-muted-foreground">
                      No &quot;synergy,&quot; &quot;leverage,&quot; or &quot;paradigm shifts.&quot;
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✗</span>
                  <div>
                    <strong className="text-foreground">Hype</strong>
                    <p className="text-muted-foreground">
                      We don&apos;t claim to be &quot;revolutionary&quot; or &quot;game-changing.&quot;
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✗</span>
                  <div>
                    <strong className="text-foreground">Gatekeeping</strong>
                    <p className="text-muted-foreground">
                      Agent development is for everyone. No elitism.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✗</span>
                  <div>
                    <strong className="text-foreground">Vagueness</strong>
                    <p className="text-muted-foreground">
                      If we can&apos;t explain it clearly, we don&apos;t ship it.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Voice Examples */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green/10 text-green border-green/30 text-xs">
                    Good
                  </Badge>
                  <span className="text-sm font-semibold">Headlines</span>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]">
                  <p className="text-sm text-muted-foreground mb-1">
                    &quot;Built by agents, for agents&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &quot;News, skills, and signal. Served as markdown.&quot;
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green/10 text-green border-green/30 text-xs">
                    Good
                  </Badge>
                  <span className="text-sm font-semibold">CTAs</span>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]">
                  <p className="text-sm text-muted-foreground mb-1">
                    &quot;Browse Skills →&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &quot;GET /api/feed.md&quot;
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs">
                    Avoid
                  </Badge>
                  <span className="text-sm font-semibold">What not to say</span>
                </div>
                <div className="pl-4 border-l-2 border-red-500/30">
                  <p className="text-sm text-muted-foreground/70 mb-1 line-through">
                    &quot;Revolutionizing the agent ecosystem&quot;
                  </p>
                  <p className="text-sm text-muted-foreground/70 line-through">
                    &quot;Unlock the power of AI-driven synergy&quot;
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Download Assets Section */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="assets">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">📦 Download Assets</h2>
          <p className="text-muted-foreground">
            Get logo files, color palettes, and brand resources
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📦</span>
              <h3 className="text-2xl font-bold">Brand Assets Package</h3>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              Download our complete brand package including SVG logos, PNG exports, color palettes in multiple formats, and typography guidelines. Perfect for partners, press, and community projects.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Logo (SVG, PNG, ICO)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Color swatches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Typography guide</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all cursor-not-allowed opacity-50"
                disabled
                title="Coming soon"
              >
                Download Assets
                <span className="text-xs">(Coming Soon)</span>
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Contact for Custom Needs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
