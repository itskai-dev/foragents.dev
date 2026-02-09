"use client";

import { useState } from "react";
import Link from "next/link";

interface LocalSetup {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  requirements: {
    os: string[];
    cpu: string;
    ram: string;
    storage: string;
  };
  pros: string[];
  cons: string[];
  installation: {
    steps: string[];
    code: string;
  };
}

const setups: LocalSetup[] = [
  {
    id: "openclaw",
    name: "OpenClaw",
    icon: "💻",
    tagline: "Full-featured local agent runtime with desktop UI and deep system integration",
    requirements: {
      os: ["macOS 11+", "Linux (Ubuntu 20.04+)", "Windows 10+ (WSL2)"],
      cpu: "2+ cores recommended",
      ram: "4 GB minimum, 8 GB recommended",
      storage: "1 GB for base install, 5+ GB with models",
    },
    pros: [
      "Rich desktop UI with GUI controls",
      "Deep system integration (files, camera, clipboard)",
      "Built-in session management",
      "Zero API costs (local models supported)",
      "Perfect for personal use and development",
    ],
    cons: [
      "Requires local machine to be on",
      "Limited to single machine (no cloud sync)",
      "Resource-intensive when running models locally",
      "Mac/Linux focused (Windows via WSL)",
    ],
    installation: {
      steps: [
        "Download OpenClaw CLI",
        "Initialize workspace",
        "Configure API keys or local models",
        "Start the gateway",
        "Access via desktop UI or CLI",
      ],
      code: `# Install OpenClaw (macOS/Linux)
curl -fsSL https://openclaw.ai/install.sh | sh

# Or with Homebrew (macOS)
brew install openclaw/tap/openclaw

# Initialize workspace
openclaw init ~/my-agents
cd ~/my-agents

# Configure (create .env or use openclaw config)
export ANTHROPIC_API_KEY="sk-ant-..."
# Or use local models:
# export OLLAMA_HOST="http://localhost:11434"

# Start the gateway
openclaw gateway start

# Check status
openclaw status

# Create your first agent
cat > AGENTS.md << 'EOF'
# My First Agent

I'm a personal assistant agent that helps with:
- Task management
- Research
- File organization
- Daily summaries
EOF

# Start a session
openclaw chat

# Or use the desktop UI
open http://localhost:4200`,
    },
  },
  {
    id: "langchain",
    name: "LangChain",
    icon: "🔗",
    tagline: "Python framework for building custom agent workflows and chains",
    requirements: {
      os: ["Any (Python 3.8+)"],
      cpu: "2+ cores",
      ram: "2 GB minimum, 4 GB for complex agents",
      storage: "500 MB+ for dependencies",
    },
    pros: [
      "Maximum flexibility and customization",
      "Huge ecosystem of integrations",
      "Strong community and documentation",
      "Great for research and experimentation",
    ],
    cons: [
      "Requires Python coding knowledge",
      "More setup and boilerplate",
      "Less polished than turnkey solutions",
      "No built-in UI (must build your own)",
    ],
    installation: {
      steps: [
        "Install Python 3.8+",
        "Create virtual environment",
        "Install LangChain and dependencies",
        "Write agent code",
        "Run locally",
      ],
      code: `# Install Python dependencies
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install LangChain
pip install langchain langchain-anthropic

# Create agent script: agent.py
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.tools import Tool
from langchain_core.prompts import ChatPromptTemplate

# Initialize LLM
llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    api_key="sk-ant-..."
)

# Define tools
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implement your search logic
    return f"Results for: {query}"

tools = [
    Tool(
        name="web_search",
        func=search_web,
        description="Search the web for information"
    )
]

# Create agent
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# Run agent
response = agent_executor.invoke({
    "input": "What's the weather like today?"
})
print(response["output"])

# Run it
# python agent.py`,
    },
  },
  {
    id: "autogen",
    name: "AutoGen",
    icon: "🤖",
    tagline: "Multi-agent conversation framework from Microsoft Research",
    requirements: {
      os: ["Any (Python 3.8+)"],
      cpu: "2+ cores",
      ram: "4 GB for multi-agent systems",
      storage: "500 MB+",
    },
    pros: [
      "Built for multi-agent collaboration",
      "Great for complex problem-solving",
      "Strong code generation capabilities",
      "Active Microsoft support",
    ],
    cons: [
      "More complex than single-agent frameworks",
      "Requires understanding of agent roles",
      "Can be resource-intensive",
      "Documentation still maturing",
    ],
    installation: {
      steps: [
        "Install Python 3.8+",
        "Install AutoGen",
        "Configure agent roles",
        "Define conversation patterns",
        "Run multi-agent system",
      ],
      code: `# Install AutoGen
pip install pyautogen

# Create multi-agent system: team.py
import autogen

config_list = [{
    "model": "claude-3-5-sonnet-20241022",
    "api_key": "sk-ant-...",
    "api_type": "anthropic"
}]

# Define agents
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list}
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config={"work_dir": "coding"}
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="Write a Python script to analyze CSV data"
)

# Run it
# python team.py`,
    },
  },
  {
    id: "raspberry-pi",
    name: "Raspberry Pi",
    icon: "🥧",
    tagline: "Low-power always-on agent server for home automation and personal use",
    requirements: {
      os: ["Raspberry Pi OS (Debian-based)"],
      cpu: "Raspberry Pi 4 (2GB+) recommended",
      ram: "2 GB minimum, 4 GB for production",
      storage: "16 GB SD card minimum, 32 GB+ recommended",
    },
    pros: [
      "Very low power consumption (~5W)",
      "Always-on without high electricity bills",
      "Perfect for home automation agents",
      "Cheap hardware (~$50-100)",
    ],
    cons: [
      "Limited compute power",
      "Not suitable for large models",
      "SD card reliability issues",
      "Requires some Linux knowledge",
    ],
    installation: {
      steps: [
        "Flash Raspberry Pi OS",
        "Set up SSH access",
        "Install Docker or Python environment",
        "Deploy agent",
        "Configure auto-start on boot",
      ],
      code: `# SSH into your Raspberry Pi
ssh pi@raspberrypi.local

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi

# Or install Python environment
sudo apt install python3-pip python3-venv -y

# Deploy agent with Docker
docker run -d --restart=always \\
  --name agent \\
  -e ANTHROPIC_API_KEY=sk-ant-... \\
  -v /home/pi/agent-data:/data \\
  your-agent-image:latest

# Or with systemd service
sudo cat > /etc/systemd/system/agent.service << 'EOF'
[Unit]
Description=AI Agent
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/agent
ExecStart=/home/pi/agent/venv/bin/python agent.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable agent
sudo systemctl start agent

# Monitor
docker logs -f agent
# or
sudo journalctl -u agent -f`,
    },
  },
];

const platformTips = [
  {
    platform: "macOS",
    icon: "🍎",
    tips: [
      "Use Homebrew for easy installation: `brew install openclaw`",
      "Grant Terminal full disk access in System Preferences → Privacy",
      "Use `caffeinate` to prevent sleep during long-running tasks",
      "Docker Desktop works great for containerized agents",
      "Raycast/Alfred integration for quick agent access",
    ],
  },
  {
    platform: "Linux",
    icon: "🐧",
    tips: [
      "Ubuntu 22.04+ LTS recommended for stability",
      "Use systemd for auto-starting agents on boot",
      "Consider running headless with tmux/screen for persistence",
      "Docker is native and performs better than macOS",
      "Use ufw for basic firewall protection",
    ],
  },
  {
    platform: "Windows",
    icon: "🪟",
    tips: [
      "Use WSL2 (Windows Subsystem for Linux) for best compatibility",
      "Install Docker Desktop with WSL2 backend",
      "PowerShell can run agents natively with some frameworks",
      "Use Windows Terminal for better CLI experience",
      "Task Scheduler for auto-start on boot",
    ],
  },
];

export default function LocalHostingPage() {
  const [selectedSetup, setSelectedSetup] = useState<string>("openclaw");

  const setup = setups.find((s) => s.id === selectedSetup) || setups[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Link
          href="/hosting"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#06D6A0] mb-6 transition-colors"
        >
          ← Back to Hosting Overview
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">💻 Local Setup Guide</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Run agents locally with full control, zero cloud costs, and complete privacy
        </p>
      </section>

      {/* Setup Selector */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex gap-3 flex-wrap justify-center">
          {setups.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSetup(s.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedSetup === s.id
                  ? "bg-[#06D6A0]/10 border-[#06D6A0] text-white"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <span className="mr-2">{s.icon}</span>
              {s.name}
            </button>
          ))}
        </div>
      </section>

      {/* Setup Details */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">{setup.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{setup.name}</h2>
            <p className="text-lg text-gray-400">{setup.tagline}</p>
          </div>

          {/* System Requirements */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white mb-4">💾 System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Operating Systems:</span>
                <div className="mt-1 space-y-1">
                  {setup.requirements.os.map((os, i) => (
                    <div key={i} className="text-sm text-gray-300">• {os}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">CPU:</span>
                  <div className="text-sm text-gray-300">{setup.requirements.cpu}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">RAM:</span>
                  <div className="text-sm text-gray-300">{setup.requirements.ram}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Storage:</span>
                  <div className="text-sm text-gray-300">{setup.requirements.storage}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
              <h3 className="text-lg font-semibold text-emerald-500 mb-4">✅ Advantages</h3>
              <ul className="space-y-2">
                {setup.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">⚠️ Limitations</h3>
              <ul className="space-y-2">
                {setup.cons.map((con, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Installation */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white mb-4">🚀 Installation & Setup</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Steps:</h4>
              <ol className="space-y-2">
                {setup.installation.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Commands:</h4>
              <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 overflow-x-auto text-xs text-gray-300 leading-relaxed">
                {setup.installation.code}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Platform-Specific Tips */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">💡 Platform-Specific Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platformTips.map((platform) => (
            <div key={platform.platform} className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{platform.icon}</div>
                <h3 className="text-lg font-semibold text-white">{platform.platform}</h3>
              </div>
              <ul className="space-y-2">
                {platform.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-[#06D6A0] mt-1">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Networking & Access */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">🌐 Networking & Remote Access</h2>
          <p className="text-sm text-gray-400 mb-6">
            Access your local agent from anywhere with tunnels and port forwarding
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Option 1: ngrok (Easiest)</h3>
              <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# Install ngrok
brew install ngrok  # or download from ngrok.com

# Expose local port
ngrok http 3000

# You get a public URL like:
# https://abc123.ngrok.io → http://localhost:3000`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Option 2: Cloudflare Tunnel (Free)</h3>
              <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Create tunnel
cloudflared tunnel create my-agent

# Route traffic
cloudflared tunnel route dns my-agent agent.yourdomain.com

# Run tunnel
cloudflared tunnel run my-agent`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Option 3: Tailscale (Private Network)</h3>
              <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# Install Tailscale
brew install tailscale

# Connect to your tailnet
sudo tailscale up

# Access from any device on your tailnet:
# http://<machine-name>:3000`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Monitoring & Health Checks</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Check if agent is running:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# OpenClaw
openclaw status

# Docker
docker ps | grep agent

# Python/systemd
ps aux | grep agent
systemctl status agent`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">View logs:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# OpenClaw
openclaw logs --follow

# Docker
docker logs -f agent

# systemd
journalctl -u agent -f`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Resource usage:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`# System stats
htop  # or: top

# Docker stats
docker stats agent

# Disk usage
df -h`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/hosting/containers"
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">🐳</div>
            <h3 className="text-lg font-semibold text-white mb-2">Containerize Your Agent</h3>
            <p className="text-sm text-gray-400">
              Package your local agent for easy deployment anywhere
            </p>
          </Link>

          <Link
            href="/guides"
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">📖</div>
            <h3 className="text-lg font-semibold text-white mb-2">Agent Configuration</h3>
            <p className="text-sm text-gray-400">
              Learn how to configure and customize your agent
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
