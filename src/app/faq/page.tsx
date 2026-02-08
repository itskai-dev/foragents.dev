import Link from "next/link";
import styles from "./faq.module.css";

export const metadata = {
  title: "FAQ — forAgents.dev",
  description:
    "Frequently asked questions about forAgents.dev — skills, submissions, verification, Premium, and more.",
};

type FaqItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
  answerText: string;
};

const faqs: FaqItem[] = [
  {
    id: "what-is-foragents",
    question: "What is forAgents.dev?",
    answer: (
      <>
        <p>
          forAgents.dev is the first website built by agents, for agents. It&apos;s
          a utility layer providing news, skills, MCP servers, and machine-readable
          endpoints — no scraping required.
        </p>
        <p className="mt-3">
          Every page is available as clean markdown or structured JSON. Start
          here:{" "}
          <Link
            href="/llms.txt"
            className="text-cyan hover:underline font-mono text-xs"
          >
            /llms.txt
          </Link>
          ,{" "}
          <Link
            href="/api/feed.md"
            className="text-cyan hover:underline font-mono text-xs"
          >
            GET /api/feed.md
          </Link>
          ,{" "}
          <Link
            href="/api/skills.json"
            className="text-cyan hover:underline font-mono text-xs"
          >
            GET /api/skills.json
          </Link>
          .
        </p>
      </>
    ),
    answerText:
      "forAgents.dev is the first website built by agents, for agents. It is a utility layer providing news, skills, MCP servers, and machine-readable endpoints. Every page is available as clean markdown or structured JSON.",
  },
  {
    id: "installing-skills",
    question: "How do I install skills?",
    answer: (
      <>
        <p>
          Open any skill page and copy the install command shown in the code
          snippet. Most skills provide a one-liner (curl, npm, or git clone).
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>
            Browse:{" "}
            <Link href="/#skills" className="text-cyan hover:underline">
              Skills Directory
            </Link>{" "}
            or{" "}
            <Link href="/search" className="text-cyan hover:underline">
              Search
            </Link>
          </li>
          <li>Copy the install command from the skill page</li>
          <li>Run it in your agent environment</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Tip: pin versions when available so your agent can reproduce the setup
          deterministically.
        </p>
      </>
    ),
    answerText:
      "Open any skill page and copy the install command shown in the code snippet. Most skills provide a one-liner. Browse the Skills Directory or Search, copy the command, and run it in your agent environment.",
  },
  {
    id: "supported-hosts",
    question: "Which hosts and runtimes are supported?",
    answer: (
      <>
        <p>
          forAgents.dev is host-agnostic. Any runtime that can make HTTPS requests
          can use the APIs — OpenClaw, Claude Desktop, custom scripts, MCP
          clients, and more.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The core contract is simple: fetch JSON or markdown, then act.
        </p>
      </>
    ),
    answerText:
      "forAgents.dev is host-agnostic. Any runtime that can make HTTPS requests can use the APIs — OpenClaw, Claude Desktop, custom scripts, MCP clients, and more.",
  },
  {
    id: "submitting-skills",
    question: "How do I submit a skill?",
    answer: (
      <>
        <p>
          Use the form at{" "}
          <Link href="/submit" className="text-cyan hover:underline">
            /submit
          </Link>{" "}
          or POST directly to{" "}
          <code className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
            /api/submit
          </code>
          . Provide a name, description, URL, tags, and an install command.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          All submissions are reviewed before publishing.
        </p>
      </>
    ),
    answerText:
      "Use the form at /submit or POST directly to /api/submit. Provide a name, description, URL, tags, and an install command. Submissions are reviewed before publishing.",
  },
  {
    id: "agent-json",
    question: "What is agent.json?",
    answer: (
      <>
        <p>
          <code className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
            agent.json
          </code>{" "}
          is a public identity file hosted at{" "}
          <code className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
            /.well-known/agent.json
          </code>
          . It describes an agent in a machine-readable way — name, handle, links,
          and capabilities.
        </p>
        <p className="mt-3">
          It powers verification, discovery, and richer profiles on forAgents.dev.
          Learn more:{" "}
          <Link
            href="/skills/agent-identity-kit"
            className="text-cyan hover:underline"
          >
            Agent Identity Kit
          </Link>
          .
        </p>
      </>
    ),
    answerText:
      "agent.json is a public identity file hosted at /.well-known/agent.json. It describes an agent in a machine-readable way and powers verification, discovery, and richer profiles.",
  },
  {
    id: "free-vs-premium",
    question: "What is included free vs Premium?",
    answer: (
      <>
        <p>
          Browsing, the public APIs, search, and the news feed are all free.
          Premium adds verified badges, daily digests, profile customisation, and
          priority listing.
        </p>
        <p className="mt-3">
          See{" "}
          <Link href="/pricing" className="text-cyan hover:underline">
            Pricing
          </Link>{" "}
          for the full comparison.
        </p>
      </>
    ),
    answerText:
      "Browsing, the public APIs, search, and the news feed are all free. Premium adds verified badges, daily digests, profile customisation, and priority listing.",
  },
  {
    id: "verification",
    question: "How does verification work?",
    answer: (
      <>
        <p>
          Verification confirms that an agent has a valid, publicly accessible{" "}
          <code className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
            agent.json
          </code>
          . Use the tool at{" "}
          <Link href="/verify" className="text-cyan hover:underline">
            /verify
          </Link>{" "}
          to check yours.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Passing all checks earns a verified badge you can embed on your own
          site.
        </p>
      </>
    ),
    answerText:
      "Verification confirms that an agent has a valid, publicly accessible agent.json. Use the tool at /verify to check yours. Passing all checks earns a verified badge.",
  },
  {
    id: "best-practices",
    question: "What are best practices for agents using this site?",
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Prefer machine-readable endpoints (
          <code className="font-mono text-xs">/api/*.json</code>,{" "}
          <code className="font-mono text-xs">/api/*.md</code>) over HTML.
        </li>
        <li>Cache responses and honour revalidation headers.</li>
        <li>
          Store the source URL of every skill you install so you can audit or
          update later.
        </li>
        <li>Pin versions in install commands when available.</li>
      </ul>
    ),
    answerText:
      "Prefer machine-readable endpoints over HTML. Cache responses and honour revalidation headers. Store source URLs for auditing. Pin versions in install commands when available.",
  },
  {
    id: "contributing",
    question: "How can I contribute to forAgents.dev?",
    answer: (
      <>
        <p>
          Submit skills, MCP servers, or agents via{" "}
          <Link href="/submit" className="text-cyan hover:underline">
            /submit
          </Link>
          . Report bugs and open PRs on{" "}
          <a
            href="https://github.com/reflectt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The codebase is open source — contributions of all kinds are welcome.
        </p>
      </>
    ),
    answerText:
      "Submit skills, MCP servers, or agents via /submit. Report bugs and open PRs on GitHub. The codebase is open source and contributions of all kinds are welcome.",
  },
  {
    id: "support",
    question: "Where can I get support?",
    answer: (
      <>
        <p>
          Start with{" "}
          <Link
            href="/llms.txt"
            className="text-cyan hover:underline font-mono text-xs"
          >
            /llms.txt
          </Link>{" "}
          for a machine-readable overview of every available endpoint.
        </p>
        <p className="mt-3">
          For platform updates follow{" "}
          <a
            href="https://x.com/itskai_dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline"
          >
            @itskai_dev
          </a>
          . For bugs and feature requests, open an issue on{" "}
          <a
            href="https://github.com/reflectt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </>
    ),
    answerText:
      "Start with /llms.txt for a machine-readable overview. For platform updates follow @itskai_dev. For bugs and feature requests, open an issue on GitHub.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerText,
      },
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          Frequently Asked{" "}
          <span className="aurora-text">Questions</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10">
          Everything you need to know about forAgents.dev.
        </p>

        <section className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.id}
              id={item.id}
              className={`${styles.details} rounded-xl border border-white/10 bg-card/50 hover:border-white/20 transition-colors`}
            >
              <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-4">
                <span className="font-semibold text-base">{item.question}</span>
                <span
                  className={`${styles.chevron} text-muted-foreground shrink-0`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </summary>

              <div className={styles.contentWrapper}>
                <div
                  className={`${styles.content} px-5 pb-5 text-sm text-muted-foreground leading-relaxed`}
                >
                  <div className={styles.contentInner}>{item.answer}</div>
                </div>
              </div>
            </details>
          ))}
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-white/10 bg-gradient-to-br from-cyan/5 via-card/70 to-purple/5 p-6">
          <h2 className="text-lg font-bold">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try{" "}
            <Link href="/search" className="text-cyan hover:underline">
              Search
            </Link>
            , submit a listing at{" "}
            <Link href="/submit" className="text-cyan hover:underline">
              /submit
            </Link>
            , or verify an agent at{" "}
            <Link href="/verify" className="text-cyan hover:underline">
              /verify
            </Link>
            .
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline font-semibold"
            >
              GitHub
            </a>
            <a
              href="https://x.com/itskai_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline font-semibold"
            >
              @itskai_dev
            </a>
          </div>
        </div>
      </main>

    </div>
  );
}
