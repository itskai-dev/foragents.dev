"use client";

import { useState } from "react";
import Link from "next/link";

interface CloudPlatform {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  pros: string[];
  cons: string[];
  pricing: {
    tier: string;
    cost: string;
    includes: string[];
  }[];
  quickStart: {
    title: string;
    steps: string[];
    code?: string;
  };
}

const platforms: CloudPlatform[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: "☁️",
    tagline: "Enterprise-grade cloud with maximum control and scaling",
    pros: [
      "Massive ecosystem with 200+ services",
      "Best-in-class scaling and reliability",
      "Strong enterprise support and compliance",
      "Extensive documentation and community",
    ],
    cons: [
      "Complex pricing model",
      "Steep learning curve",
      "Can be expensive without optimization",
      "Overwhelming number of options",
    ],
    pricing: [
      {
        tier: "EC2 t3.micro",
        cost: "$0.0104/hour (~$7.50/mo)",
        includes: ["1 vCPU", "1 GB RAM", "Moderate network", "EBS storage extra"],
      },
      {
        tier: "EC2 t3.small",
        cost: "$0.0208/hour (~$15/mo)",
        includes: ["2 vCPU", "2 GB RAM", "Good for production", "Better network"],
      },
      {
        tier: "Lambda",
        cost: "Free tier: 1M requests/mo",
        includes: ["Pay per execution", "400k GB-seconds/mo free", "Auto-scaling"],
      },
    ],
    quickStart: {
      title: "Deploy to AWS EC2 with Terraform",
      steps: [
        "Install AWS CLI and Terraform",
        "Configure AWS credentials",
        "Create Terraform configuration",
        "Deploy infrastructure",
        "Set up continuous deployment",
      ],
      code: `# terraform/main.tf
provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "agent" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04
  instance_type = "t3.small"
  
  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
    docker run -d --restart=always \\
      -e ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY} \\
      your-agent-image:latest
  EOF

  tags = {
    Name = "ai-agent"
  }
}

resource "aws_security_group" "agent" {
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Deploy
# terraform init
# terraform plan
# terraform apply`,
    },
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: "🔵",
    tagline: "Serverless-first cloud with excellent developer experience",
    pros: [
      "Best serverless container platform (Cloud Run)",
      "Generous free tier",
      "Simple, predictable pricing",
      "Excellent documentation",
    ],
    cons: [
      "Smaller ecosystem than AWS",
      "Fewer regions globally",
      "Less enterprise adoption",
      "Some services less mature",
    ],
    pricing: [
      {
        tier: "Cloud Run",
        cost: "First 2M requests/mo free",
        includes: ["Pay per use", "Auto-scaling to zero", "Built-in SSL", "Container-based"],
      },
      {
        tier: "Compute Engine e2-micro",
        cost: "$6.11/month",
        includes: ["0.25-2 vCPU", "1 GB RAM", "Always-free tier eligible"],
      },
      {
        tier: "Cloud Functions",
        cost: "2M invocations/mo free",
        includes: ["400k GB-seconds free", "Event-driven", "Auto-scaling"],
      },
    ],
    quickStart: {
      title: "Deploy to Cloud Run in 5 minutes",
      steps: [
        "Install gcloud CLI",
        "Authenticate with GCP",
        "Build container image",
        "Deploy to Cloud Run",
        "Get HTTPS URL instantly",
      ],
      code: `# Install gcloud
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy ai-agent \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars ANTHROPIC_API_KEY=sk-xxx

# You get an HTTPS URL immediately!
# https://ai-agent-xxx.run.app

# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]`,
    },
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "🔷",
    tagline: "Enterprise cloud with strong Microsoft ecosystem integration",
    pros: [
      "Best for Microsoft stack (Active Directory, .NET)",
      "Strong compliance and enterprise features",
      "Good for hybrid cloud scenarios",
      "Competitive pricing with reserved instances",
    ],
    cons: [
      "Complex portal interface",
      "Steeper learning curve than GCP",
      "Some documentation gaps",
      "Pricing can be confusing",
    ],
    pricing: [
      {
        tier: "Container Instances",
        cost: "$0.0000125/vCPU-second + $0.0000014/GB-second",
        includes: ["Pay per second", "Fast startup", "No cluster management"],
      },
      {
        tier: "VM B1s",
        cost: "$7.59/month",
        includes: ["1 vCPU", "1 GB RAM", "Linux VM", "Good for small agents"],
      },
      {
        tier: "Functions",
        cost: "1M executions/mo free",
        includes: ["400k GB-seconds free", "Event-driven", "Multiple triggers"],
      },
    ],
    quickStart: {
      title: "Deploy to Azure Container Instances",
      steps: [
        "Install Azure CLI",
        "Login to Azure",
        "Create resource group",
        "Deploy container",
        "Access via public IP",
      ],
      code: `# Install Azure CLI
brew install azure-cli  # macOS
# or: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name agent-rg --location westus2

# Deploy container
az container create \\
  --resource-group agent-rg \\
  --name ai-agent \\
  --image your-registry/agent:latest \\
  --cpu 1 --memory 1 \\
  --restart-policy Always \\
  --environment-variables \\
    ANTHROPIC_API_KEY=sk-xxx

# Get IP
az container show \\
  --resource-group agent-rg \\
  --name ai-agent \\
  --query ipAddress.ip`,
    },
  },
  {
    id: "railway",
    name: "Railway",
    icon: "🚂",
    tagline: "Zero-config deployment for developers who just want things to work",
    pros: [
      "Simplest deployment experience",
      "Git-based automatic deployments",
      "Built-in databases and services",
      "Great for indie hackers",
    ],
    cons: [
      "Limited to 500 hours/mo on free tier",
      "Less control over infrastructure",
      "Smaller community",
      "Can be pricey at scale",
    ],
    pricing: [
      {
        tier: "Hobby",
        cost: "$5/month + usage",
        includes: ["$5 credit/mo", "Unlimited projects", "512 MB RAM default", "Auto SSL"],
      },
      {
        tier: "Pro",
        cost: "$20/month + usage",
        includes: ["$20 credit/mo", "Priority support", "Team collaboration", "More resources"],
      },
    ],
    quickStart: {
      title: "Deploy to Railway (easiest option!)",
      steps: [
        "Sign up at railway.app",
        "Install Railway CLI",
        "Initialize project",
        "Deploy with one command",
        "Get URL automatically",
      ],
      code: `# Install Railway CLI
npm install -g @railway/cli
# or: brew install railway

# Login
railway login

# Initialize (in your project directory)
railway init

# Link to project
railway link

# Deploy
railway up

# That's it! You get:
# - Automatic HTTPS
# - Environment variables UI
# - Zero-downtime deploys
# - Built-in monitoring

# Set environment variables
railway variables set ANTHROPIC_API_KEY=sk-xxx

# View logs
railway logs`,
    },
  },
  {
    id: "flyio",
    name: "Fly.io",
    icon: "🪰",
    tagline: "Deploy to the edge for global low-latency access",
    pros: [
      "Global edge deployment",
      "Excellent for WebSocket apps",
      "Simple pricing and billing",
      "Great developer experience",
    ],
    cons: [
      "Smaller than major clouds",
      "Limited to containerized apps",
      "Fewer managed services",
      "New platform (less mature)",
    ],
    pricing: [
      {
        tier: "Free tier",
        cost: "$0",
        includes: ["3 shared-cpu VMs", "3GB storage", "160GB bandwidth/mo"],
      },
      {
        tier: "Paid",
        cost: "~$5-15/month",
        includes: ["Per-resource pricing", "Auto-scaling", "Global deployment"],
      },
    ],
    quickStart: {
      title: "Deploy to Fly.io for global edge access",
      steps: [
        "Install flyctl CLI",
        "Sign up and login",
        "Launch app (auto-generates config)",
        "Deploy globally",
        "Scale to multiple regions",
      ],
      code: `# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app (creates fly.toml)
flyctl launch
# Answer prompts: app name, region, etc.

# Deploy
flyctl deploy

# Scale to multiple regions for global edge
flyctl regions add iad lhr syd hkg
flyctl scale count 3

# Set secrets
flyctl secrets set ANTHROPIC_API_KEY=sk-xxx

# Monitor
flyctl status
flyctl logs

# Your app is now running globally!`,
    },
  },
  {
    id: "lambda",
    name: "AWS Lambda (Serverless)",
    icon: "λ",
    tagline: "Event-driven functions with zero infrastructure management",
    pros: [
      "Pay only for execution time",
      "Automatic scaling to zero",
      "Integrates with entire AWS ecosystem",
      "Generous free tier (1M requests/mo)",
    ],
    cons: [
      "Cold start latency (1-5 seconds)",
      "15-minute max execution time",
      "Complex for long-running agents",
      "State management challenges",
    ],
    pricing: [
      {
        tier: "Free tier",
        cost: "1M requests/month free",
        includes: ["400k GB-seconds compute free", "Forever free tier"],
      },
      {
        tier: "Paid",
        cost: "$0.20 per 1M requests",
        includes: ["+ $0.0000166667/GB-second compute", "Pay per millisecond"],
      },
    ],
    quickStart: {
      title: "Serverless Agent with AWS Lambda",
      steps: [
        "Install Serverless Framework",
        "Create serverless.yml config",
        "Write Lambda handler",
        "Deploy to AWS",
        "Trigger via API Gateway or events",
      ],
      code: `# Install Serverless Framework
npm install -g serverless

# Create project
serverless create --template aws-nodejs --path agent-lambda
cd agent-lambda

# serverless.yml
service: ai-agent
provider:
  name: aws
  runtime: nodejs20.x
  environment:
    ANTHROPIC_API_KEY: \${env:ANTHROPIC_API_KEY}

functions:
  agent:
    handler: handler.agent
    events:
      - http:
          path: agent
          method: post
    timeout: 300  # 5 minutes

# handler.js
export const agent = async (event) => {
  const { prompt } = JSON.parse(event.body);
  // Your agent logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ response: "..." })
  };
};

# Deploy
serverless deploy

# Invoke
serverless invoke -f agent --data '{"prompt": "Hello"}'`,
    },
  },
  {
    id: "vercel",
    name: "Vercel Functions",
    icon: "▲",
    tagline: "Serverless functions optimized for Next.js and edge deployment",
    pros: [
      "Perfect for Next.js agents",
      "Edge functions for low latency",
      "Instant deployments",
      "Excellent developer experience",
    ],
    cons: [
      "10-second timeout on hobby plan",
      "Optimized for frontend, not long-running tasks",
      "Can be expensive at scale",
      "Limited to HTTP triggers",
    ],
    pricing: [
      {
        tier: "Hobby",
        cost: "$0/month",
        includes: ["100GB bandwidth", "Serverless functions", "Edge functions", "1000 builds/mo"],
      },
      {
        tier: "Pro",
        cost: "$20/month",
        includes: ["1TB bandwidth", "Longer timeouts", "Team collaboration", "Analytics"],
      },
    ],
    quickStart: {
      title: "Deploy Next.js agent to Vercel",
      steps: [
        "Create Next.js app with agent routes",
        "Add Vercel configuration",
        "Connect GitHub repo",
        "Deploy automatically on push",
        "Access via Vercel URL",
      ],
      code: `# Create Next.js app
npx create-next-app@latest agent-app
cd agent-app

# Create API route: app/api/agent/route.ts
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return Response.json({ response: message.content });
}

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or connect GitHub and deploy on push
# Set env vars in Vercel dashboard`,
    },
  },
];

export default function CloudHostingPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("railway");

  const platform = platforms.find((p) => p.id === selectedPlatform) || platforms[3];

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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">☁️ Cloud Deployment Guide</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Step-by-step guides for deploying agents to AWS, GCP, Azure, Railway, Fly.io, and serverless
          platforms
        </p>
      </section>

      {/* Platform Selector */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex gap-3 flex-wrap justify-center">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedPlatform === p.id
                  ? "bg-[#06D6A0]/10 border-[#06D6A0] text-white"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <span className="mr-2">{p.icon}</span>
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Platform Details */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">{platform.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{platform.name}</h2>
            <p className="text-lg text-gray-400">{platform.tagline}</p>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
              <h3 className="text-lg font-semibold text-emerald-500 mb-4">✅ Pros</h3>
              <ul className="space-y-2">
                {platform.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">⚠️ Cons</h3>
              <ul className="space-y-2">
                {platform.cons.map((con, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white mb-4">💰 Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platform.pricing.map((tier, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <h4 className="font-semibold text-white mb-1">{tier.tier}</h4>
                  <p className="text-lg text-[#06D6A0] mb-3">{tier.cost}</p>
                  <ul className="space-y-1">
                    {tier.includes.map((item, j) => (
                      <li key={j} className="text-xs text-gray-400 flex items-start gap-1">
                        <span className="text-gray-600">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white mb-4">🚀 {platform.quickStart.title}</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Steps:</h4>
              <ol className="space-y-2">
                {platform.quickStart.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {platform.quickStart.code && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Code:</h4>
                <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 overflow-x-auto text-xs text-gray-300 leading-relaxed">
                  {platform.quickStart.code}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Cost Estimation Calculator</h2>
          <p className="text-sm text-gray-400 mb-6">
            Rough monthly cost estimates for different agent workloads:
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-semibold text-gray-300">Workload</div>
              <div className="font-semibold text-gray-300">Specs</div>
              <div className="font-semibold text-gray-300">Est. Cost</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 p-3 bg-gray-800/30 rounded">
              <div>Light (personal assistant)</div>
              <div>512 MB RAM, low traffic</div>
              <div className="text-[#06D6A0]">$5-10/mo</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 p-3 bg-gray-800/30 rounded">
              <div>Medium (team agent)</div>
              <div>1-2 GB RAM, moderate traffic</div>
              <div className="text-[#06D6A0]">$15-30/mo</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 p-3 bg-gray-800/30 rounded">
              <div>Heavy (production)</div>
              <div>4 GB RAM, high availability</div>
              <div className="text-[#06D6A0]">$50-100/mo</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 p-3 bg-gray-800/30 rounded">
              <div>Serverless (sporadic)</div>
              <div>On-demand, &lt;1M requests/mo</div>
              <div className="text-[#06D6A0]">Free - $5/mo</div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            * Estimates vary by platform, region, and API costs. Always check current pricing.
          </p>
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
              Learn Docker best practices for deploying agents
            </p>
          </Link>

          <Link
            href="/security"
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Your Deployment</h3>
            <p className="text-sm text-gray-400">
              Production security checklist and best practices
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
