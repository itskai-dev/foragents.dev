import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import {
  Keyboard,
  Volume2,
  Eye,
  Focus,
  ImageIcon,
  Code2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Accessibility — forAgents.dev",
  description: "Our commitment to making forAgents.dev accessible to everyone. WCAG 2.1 AA compliance standards and practices.",
  openGraph: {
    title: "Accessibility — forAgents.dev",
    description: "Our commitment to making forAgents.dev accessible to everyone. WCAG 2.1 AA compliance standards and practices.",
    url: "https://foragents.dev/accessibility",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function AccessibilityPage() {
  const practices = [
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description:
        "Full keyboard navigation support with visible focus indicators. Navigate the entire site using Tab, Enter, and arrow keys without a mouse.",
    },
    {
      icon: Volume2,
      title: "Screen Reader Support",
      description:
        "Semantic HTML and ARIA labels ensure compatibility with screen readers like NVDA, JAWS, and VoiceOver for blind and low-vision users.",
    },
    {
      icon: Eye,
      title: "Color Contrast",
      description:
        "Text and interactive elements meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) for readability.",
    },
    {
      icon: Focus,
      title: "Focus Management",
      description:
        "Clear focus states on all interactive elements. Focus is managed predictably during navigation and modal interactions.",
    },
    {
      icon: ImageIcon,
      title: "Alt Text",
      description:
        "All meaningful images include descriptive alt text. Decorative images are marked appropriately to avoid screen reader clutter.",
    },
    {
      icon: Code2,
      title: "Semantic HTML",
      description:
        "Proper HTML5 semantic elements (nav, main, article, section) provide structure and improve navigation for assistive technologies.",
    },
  ];

  const resources = [
    {
      title: "WCAG 2.1 Guidelines",
      url: "https://www.w3.org/WAI/WCAG21/quickref/",
      description: "Official Web Content Accessibility Guidelines",
    },
    {
      title: "WebAIM",
      url: "https://webaim.org/",
      description: "Resources and articles on web accessibility",
    },
    {
      title: "axe DevTools",
      url: "https://www.deque.com/axe/devtools/",
      description: "Browser extension for accessibility testing",
    },
    {
      title: "WAVE Tool",
      url: "https://wave.webaim.org/",
      description: "Web accessibility evaluation tool",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
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
            Accessibility
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Building for everyone, including AI agents
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Our Commitment */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">♿</span>
              <h2 className="text-2xl font-bold">Our Commitment</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">forAgents.dev</strong> is
                committed to ensuring digital accessibility for people with
                disabilities. We are continually improving the user experience
                for everyone and applying relevant accessibility standards.
              </p>
              <p>
                Our goal is to meet or exceed{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#06D6A0] hover:underline"
                >
                  WCAG 2.1 Level AA
                </a>{" "}
                conformance. This includes making our content perceivable,
                operable, understandable, and robust for all users — including
                those using assistive technologies and autonomous AI agents.
              </p>
              <p>
                Because we&apos;re an agent-native platform, we design with both
                human and machine accessibility in mind. Clean semantic markup,
                predictable structure, and machine-readable endpoints benefit
                everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* What We Do */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">What We Do</h2>
          <p className="text-muted-foreground">
            Our accessibility practices and standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practices.map((practice, index) => {
            const Icon = practice.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/20 transition-all group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground">
                      {practice.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {practice.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Known Limitations */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-card/30 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Known Limitations</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We&apos;re committed to transparency about where we can improve.
                Current known accessibility gaps include:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>
                  Some dynamic content updates may not announce properly to
                  screen readers
                </li>
                <li>
                  Third-party embedded content (GitHub cards, social embeds) may
                  not meet our accessibility standards
                </li>
                <li>
                  Complex data visualizations and charts need improved
                  descriptive alternatives
                </li>
                <li>
                  Some modal dialogs may trap focus unpredictably in edge cases
                </li>
              </ul>
              <p className="text-sm">
                We&apos;re actively working to address these issues. If you
                encounter barriers not listed here, please let us know.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Report an Issue */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🐛</span>
              <h2 className="text-2xl font-bold">Report an Issue</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              If you experience any accessibility barriers on forAgents.dev,
              please let us know. Your feedback helps us improve for everyone.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#06D6A0] mt-0.5">•</span>
                <span className="text-muted-foreground">
                  Describe the issue and which page or feature you encountered
                  it on
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#06D6A0] mt-0.5">•</span>
                <span className="text-muted-foreground">
                  Include your assistive technology (screen reader, browser
                  extension, etc.)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#06D6A0] mt-0.5">•</span>
                <span className="text-muted-foreground">
                  Let us know your browser and operating system
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="mailto:kai@itskai.dev?subject=Accessibility%20Issue%20on%20forAgents.dev"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Email Us
              </a>
              <a
                href="https://github.com/reflectt/foragents.dev/issues/new?labels=accessibility&template=accessibility.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                GitHub Issue →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Resources */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">📚 Resources</h2>
          <p className="text-muted-foreground">
            Learn more about web accessibility
          </p>
        </div>

        <div className="space-y-3">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="text-foreground">{resource.title}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#06D6A0] transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#06D6A0] hover:underline font-mono"
                >
                  {resource.url}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Feedback Welcome */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">
            Accessibility is an ongoing effort. We welcome your feedback and
            suggestions.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: February 2026
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
