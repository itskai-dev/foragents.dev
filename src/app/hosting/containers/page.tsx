"use client";

import { useState } from "react";
import Link from "next/link";

interface DockerTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  useCase: string;
  code: string;
}

const dockerTemplates: DockerTemplate[] = [
  {
    id: "basic",
    name: "Basic Agent Container",
    icon: "📦",
    description: "Simple single-container agent for development and testing",
    useCase: "Personal use, development, single-agent deployments",
    code: `# Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create data directory for persistence
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV DATA_DIR=/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run as non-root user
USER node

# Expose port
EXPOSE 3000

# Start agent
CMD ["node", "agent.js"]

# Build and run:
# docker build -t my-agent .
# docker run -d --name agent \\
#   -e ANTHROPIC_API_KEY=sk-ant-... \\
#   -v ./data:/data \\
#   -p 3000:3000 \\
#   --restart=unless-stopped \\
#   my-agent`,
  },
  {
    id: "python",
    name: "Python Agent (LangChain)",
    icon: "🐍",
    description: "Python-based agent with LangChain and dependencies",
    useCase: "LangChain agents, Python frameworks, data science workflows",
    code: `# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

EXPOSE 8000

CMD ["python", "agent.py"]

# requirements.txt:
# langchain==0.1.0
# langchain-anthropic==0.1.0
# fastapi==0.109.0
# uvicorn==0.27.0

# Build and run:
# docker build -t python-agent .
# docker run -d --name agent \\
#   -e ANTHROPIC_API_KEY=sk-ant-... \\
#   -p 8000:8000 \\
#   python-agent`,
  },
  {
    id: "multi-stage",
    name: "Multi-Stage Build (Optimized)",
    icon: "⚡",
    description: "Optimized multi-stage build for smaller image size",
    useCase: "Production deployments, bandwidth-constrained environments",
    code: `# Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /build/dist ./dist

# Create non-root user
RUN addgroup -g 1000 agent && \\
    adduser -D -u 1000 -G agent agent && \\
    chown -R agent:agent /app

USER agent

EXPOSE 3000

CMD ["node", "dist/agent.js"]

# Result: Image size reduced from ~1GB to ~200MB`,
  },
];

const composeExamples = [
  {
    id: "single",
    name: "Single Agent with Database",
    icon: "🗄️",
    description: "Agent with persistent PostgreSQL database",
    code: `version: '3.8'

services:
  agent:
    build: .
    container_name: ai-agent
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - DATABASE_URL=postgresql://agent:password@db:5432/agentdb
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    container_name: agent-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=agent
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=agentdb
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db-data:

# Run:
# docker-compose up -d`,
  },
  {
    id: "multi",
    name: "Multi-Agent System",
    icon: "🤝",
    description: "Multiple specialized agents with shared services",
    code: `version: '3.8'

services:
  # Coordinator Agent
  coordinator:
    build:
      context: ./agents/coordinator
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  # Research Agent
  researcher:
    build:
      context: ./agents/researcher
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  # Writer Agent
  writer:
    build:
      context: ./agents/writer
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  # Shared Redis for communication
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data

  # Web interface
  web:
    build:
      context: ./web
    ports:
      - "3000:3000"
    environment:
      - COORDINATOR_URL=http://coordinator:8000
    depends_on:
      - coordinator

volumes:
  redis-data:

# Run:
# docker-compose up -d --scale researcher=2`,
  },
  {
    id: "production",
    name: "Production Setup with Monitoring",
    icon: "🚀",
    description: "Production-ready with Prometheus, Grafana, and reverse proxy",
    code: `version: '3.8'

services:
  # Agent
  agent:
    build: .
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
    expose:
      - 3000
    volumes:
      - ./data:/data
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=3000"
      - "prometheus.path=/metrics"

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - agent
    restart: unless-stopped

  # Prometheus monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped

  # Grafana dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:`,
  },
];

const kubernetesExample = `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent
  labels:
    app: agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent
  template:
    metadata:
      labels:
        app: agent
    spec:
      containers:
      - name: agent
        image: your-registry/agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: agent-service
spec:
  selector:
    app: agent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: agent-secrets
type: Opaque
stringData:
  anthropic-api-key: sk-ant-...
---
# hpa.yaml (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

# Apply:
# kubectl apply -f deployment.yaml
# kubectl get pods
# kubectl logs -f deployment/ai-agent`;

export default function ContainersPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("basic");
  const [selectedCompose, setSelectedCompose] = useState<string>("single");

  const template = dockerTemplates.find((t) => t.id === selectedTemplate) || dockerTemplates[0];
  const compose = composeExamples.find((c) => c.id === selectedCompose) || composeExamples[0];

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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">🐳 Docker & Containers</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Package agents in containers for consistent deployment across any platform
        </p>
      </section>

      {/* Why Containers */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">📦 Why Containerize Your Agent?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-emerald-500 mb-2">✅ Benefits</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Consistent environments (dev = prod)</li>
                <li>• Easy deployment anywhere</li>
                <li>• Isolated dependencies</li>
                <li>• Version control with images</li>
                <li>• Simplified scaling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-amber-500 mb-2">⚠️ Considerations</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Slight overhead vs native</li>
                <li>• Learning curve for Docker</li>
                <li>• State management requires volumes</li>
                <li>• Build time for large images</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dockerfile Templates */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">📝 Dockerfile Templates</h2>
        
        {/* Template Selector */}
        <div className="flex gap-3 flex-wrap mb-6">
          {dockerTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedTemplate === t.id
                  ? "bg-[#06D6A0]/10 border-[#06D6A0] text-white"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <span className="mr-2">{t.icon}</span>
              {t.name}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{template.name}</h3>
              <p className="text-sm text-gray-400 mb-1">{template.description}</p>
              <p className="text-xs text-gray-500">Use case: {template.useCase}</p>
            </div>
          </div>

          <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 overflow-x-auto text-xs text-gray-300 leading-relaxed whitespace-pre">
            {template.code}
          </pre>
        </div>
      </section>

      {/* Docker Compose */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">🎼 Docker Compose Examples</h2>
        
        {/* Compose Selector */}
        <div className="flex gap-3 flex-wrap mb-6">
          {composeExamples.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCompose(c.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedCompose === c.id
                  ? "bg-[#06D6A0]/10 border-[#06D6A0] text-white"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <span className="mr-2">{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{compose.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{compose.name}</h3>
              <p className="text-sm text-gray-400">{compose.description}</p>
            </div>
          </div>

          <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 overflow-x-auto text-xs text-gray-300 leading-relaxed whitespace-pre">
            {compose.code}
          </pre>
        </div>
      </section>

      {/* Kubernetes */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">☸️ Kubernetes Deployment</h2>
        <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-400 mb-4">
            For production-scale deployments with automatic scaling, self-healing, and rolling updates
          </p>
          
          <pre className="p-4 rounded-lg bg-black/50 border border-gray-800 overflow-x-auto text-xs text-gray-300 leading-relaxed whitespace-pre">
            {kubernetesExample}
          </pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">💡 Container Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Image Optimization</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Use Alpine Linux for smaller images (~5MB base)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Multi-stage builds to exclude build tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Copy package files first for better layer caching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Use .dockerignore to exclude unnecessary files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Clean package manager caches in same RUN layer</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-lg font-semibold text-white mb-4">🔒 Security</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Run as non-root user (USER directive)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Don&apos;t hardcode secrets (use env vars or secrets)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Scan images for vulnerabilities (trivy, snyk)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Use official base images from trusted sources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Limit container capabilities and resources</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Resource Limits</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Set memory limits to prevent OOM kills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Define CPU limits for fair resource sharing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Use health checks for automatic restarts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Configure restart policies (unless-stopped)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Monitor resource usage in production</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-lg font-semibold text-white mb-4">💾 Data Persistence</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Use volumes for persistent data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Named volumes for better management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Bind mounts for development only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Back up volumes regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06D6A0] mt-1">→</span>
                <span>Consider external storage for production</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Commands */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">⚡ Quick Reference Commands</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Build & Run:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`docker build -t agent:latest .
docker run -d --name agent -p 3000:3000 agent:latest
docker logs -f agent
docker stop agent && docker rm agent`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Docker Compose:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`docker-compose up -d          # Start services
docker-compose ps              # List services
docker-compose logs -f agent   # Follow logs
docker-compose down            # Stop and remove
docker-compose restart agent   # Restart service`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Debugging:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`docker exec -it agent sh       # Open shell in container
docker inspect agent           # View container details
docker stats agent             # Resource usage
docker system prune -a         # Clean up unused resources`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Registry & Distribution:</h3>
              <pre className="p-3 rounded bg-black/50 border border-gray-800 text-xs text-gray-300">
{`docker tag agent:latest registry.example.com/agent:v1.0
docker push registry.example.com/agent:v1.0
docker pull registry.example.com/agent:v1.0`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/hosting/cloud"
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">☁️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Deploy to Cloud</h3>
            <p className="text-sm text-gray-400">
              Take your container to AWS, GCP, Azure, or other platforms
            </p>
          </Link>

          <Link
            href="/guides"
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-[#06D6A0]/50 transition-all"
          >
            <div className="text-3xl mb-3">📖</div>
            <h3 className="text-lg font-semibold text-white mb-2">CI/CD Integration</h3>
            <p className="text-sm text-gray-400">
              Automate builds and deployments with GitHub Actions
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
