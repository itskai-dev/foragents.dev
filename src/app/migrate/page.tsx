import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Migrate to forAgents.dev — Switch from LangChain, AutoGen, CrewAI",
  description: "Step-by-step migration guide for developers moving from LangChain, AutoGen, CrewAI, and custom solutions to forAgents.dev. Get started in minutes.",
  openGraph: {
    title: "Migrate to forAgents.dev",
    description: "Step-by-step migration guide for developers moving from other agent platforms to forAgents.dev.",
    url: "https://foragents.dev/migrate",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function MigratePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative" role="banner">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
              <span className="text-xs text-muted-foreground font-mono">
                forAgents.dev
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/10 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Migrate to forAgents.dev
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Moving from LangChain, AutoGen, CrewAI, or a custom solution? We&apos;ve got you covered with this step-by-step migration guide.
          </p>
        </div>
      </section>

      {/* Why Migrate Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Why Migrate?</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Benefit 1 */}
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">
              Faster Development
            </h3>
            <p className="text-muted-foreground">
              Skip the boilerplate. Our skills are pre-built, tested, and ready to install. What takes days in other frameworks takes minutes here.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">
              Less Maintenance
            </h3>
            <p className="text-muted-foreground">
              Community-maintained skills mean updates are handled for you. No more wrestling with breaking changes or deprecated APIs.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">
              Better Ecosystem
            </h3>
            <p className="text-muted-foreground">
              Access a growing library of skills, MCP servers, and agent templates. If you need it, someone&apos;s probably built it.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">
              Framework Agnostic
            </h3>
            <p className="text-muted-foreground">
              Skills work with any agent framework or custom setup. You&apos;re not locked into a specific architecture or vendor.
            </p>
          </div>
        </div>
      </section>

      {/* Migration Guides */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Migration Guides</h2>

        {/* From LangChain */}
        <div className="mb-12 p-6 rounded-lg border border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <h3 className="text-2xl font-bold text-white mb-4">
            From LangChain
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#06D6A0] mb-3">Migration Steps:</h4>
            <ol className="space-y-2 text-muted-foreground ml-5 list-decimal">
              <li>Identify your LangChain tools and chains</li>
              <li>Browse forAgents.dev skills for equivalent functionality</li>
              <li>Install matching skills using the one-line installer</li>
              <li>Update your agent&apos;s configuration to load skills</li>
              <li>Test and remove old LangChain dependencies</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#06D6A0]">Code Comparison:</h4>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Before (LangChain):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`from langchain.agents import initialize_agent
from langchain.tools import Tool
from langchain.llms import OpenAI

# Define custom tools
def search_web(query):
    # Custom implementation
    pass

tools = [
    Tool(
        name="WebSearch",
        func=search_web,
        description="Search the web"
    )
]

agent = initialize_agent(
    tools=tools,
    llm=OpenAI(),
    agent="zero-shot-react-description"
)`}</code>
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">After (forAgents.dev):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`# Install the skill
curl -fsSL https://forAgents.dev/api/skills/web-search.sh | bash

# Skills auto-load from ~/.openclaw/skills/
# Your agent now has web search capability
# No custom implementation needed`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* From AutoGen */}
        <div className="mb-12 p-6 rounded-lg border border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <h3 className="text-2xl font-bold text-white mb-4">
            From AutoGen
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#06D6A0] mb-3">Migration Steps:</h4>
            <ol className="space-y-2 text-muted-foreground ml-5 list-decimal">
              <li>Map your AutoGen agents to forAgents.dev agent roles</li>
              <li>Replace function calling implementations with skills</li>
              <li>Configure agent team structure using agent-team-kit</li>
              <li>Set up communication patterns in AGENTS.md</li>
              <li>Migrate conversation flows to task queues</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#06D6A0]">Code Comparison:</h4>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Before (AutoGen):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4"},
    system_message="You are a helpful assistant."
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding"}
)

user_proxy.initiate_chat(
    assistant,
    message="Write a Python script to fetch weather data"
)`}</code>
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">After (forAgents.dev):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`# Install agent-team-kit
curl -fsSL https://forAgents.dev/api/team-kit.sh | bash

# Define roles in AGENTS.md
# Weather skill auto-loads
# Task routing handled via BACKLOG.md
# No manual chat orchestration needed`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* From CrewAI */}
        <div className="mb-12 p-6 rounded-lg border border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <h3 className="text-2xl font-bold text-white mb-4">
            From CrewAI
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#06D6A0] mb-3">Migration Steps:</h4>
            <ol className="space-y-2 text-muted-foreground ml-5 list-decimal">
              <li>Convert your Crew structure to agent roles</li>
              <li>Replace CrewAI tools with forAgents.dev skills</li>
              <li>Move task definitions to BACKLOG.md format</li>
              <li>Configure agent memory using memory/ directory</li>
              <li>Set up heartbeat checks for proactive agents</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#06D6A0]">Code Comparison:</h4>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Before (CrewAI):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`from crewai import Agent, Task, Crew

researcher = Agent(
    role="Researcher",
    goal="Find accurate information",
    tools=[web_search_tool],
    backstory="Expert researcher"
)

task = Task(
    description="Research AI trends",
    agent=researcher
)

crew = Crew(
    agents=[researcher],
    tasks=[task]
)

result = crew.kickoff()`}</code>
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">After (forAgents.dev):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`# Define in SOUL.md
You are a Researcher. Your goal is to find accurate information.

# Add task to BACKLOG.md
- [ ] Research AI trends

# Skills auto-load, no tool configuration
# Agent runs autonomously via heartbeat`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* From Custom Solutions */}
        <div className="mb-12 p-6 rounded-lg border border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <h3 className="text-2xl font-bold text-white mb-4">
            From Custom Solutions
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#06D6A0] mb-3">Migration Steps:</h4>
            <ol className="space-y-2 text-muted-foreground ml-5 list-decimal">
              <li>Document your current agent&apos;s capabilities and workflows</li>
              <li>Search forAgents.dev for skills matching your custom tools</li>
              <li>Install skills and test functionality parity</li>
              <li>Migrate custom logic to AGENTS.md and SOUL.md</li>
              <li>Gradually replace custom code with community skills</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#06D6A0]">Code Comparison:</h4>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Before (Custom):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`import requests
import json

class CustomAgent:
    def __init__(self):
        self.tools = {
            "weather": self.get_weather,
            "email": self.send_email,
            "calendar": self.check_calendar
        }
    
    def get_weather(self, location):
        # 50 lines of custom code
        pass
    
    def send_email(self, to, subject, body):
        # 40 lines of custom code
        pass
    
    # Maintenance nightmare...`}</code>
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">After (forAgents.dev):</p>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`# Install pre-built skills
curl -fsSL https://forAgents.dev/api/skills/weather.sh | bash
curl -fsSL https://forAgents.dev/api/skills/email.sh | bash
curl -fsSL https://forAgents.dev/api/skills/calendar.sh | bash

# Skills maintained by the community
# Updates handled automatically
# Focus on your agent&apos;s unique logic`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Checklist */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Migration Checklist</h2>
        
        <div className="p-6 rounded-lg border border-white/10 bg-white/5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-[#06D6A0] bg-[#06D6A0]/10 flex-shrink-0 mt-0.5">
                <span className="text-[#06D6A0] text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Audit current capabilities
                </h4>
                <p className="text-sm text-muted-foreground">
                  List all tools, integrations, and custom functions your agent currently uses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-white/30 bg-white/5 flex-shrink-0 mt-0.5">
                <span className="text-white/30 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Browse the skills directory
                </h4>
                <p className="text-sm text-muted-foreground">
                  Find forAgents.dev skills that match your requirements at <Link href="/skills" className="text-[#06D6A0] hover:underline">/skills</Link>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-white/30 bg-white/5 flex-shrink-0 mt-0.5">
                <span className="text-white/30 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Install and test skills
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use one-line installers to add skills, then verify they work as expected
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-white/30 bg-white/5 flex-shrink-0 mt-0.5">
                <span className="text-white/30 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Migrate agent configuration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up AGENTS.md, SOUL.md, and other workspace files for your agent
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-white/30 bg-white/5 flex-shrink-0 mt-0.5">
                <span className="text-white/30 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Run parallel testing
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your old system running while testing the new setup to ensure parity
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-white/30 bg-white/5 flex-shrink-0 mt-0.5">
                <span className="text-white/30 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Deprecate old dependencies
                </h4>
                <p className="text-sm text-muted-foreground">
                  Once verified, remove old framework code and dependencies from your project
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 to-purple/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          
          <div className="relative p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need Help Migrating?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stuck on a migration step? Have questions about specific skills? Our community is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get Migration Support →
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-semibold text-sm hover:bg-[#06D6A0]/10 transition-colors"
              >
                Browse Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
