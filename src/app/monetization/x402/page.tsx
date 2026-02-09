"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function X402Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-500/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <Link href="/monetization">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 cursor-pointer hover:bg-cyan-500/30">
              ← Back to Monetization Guide
            </Badge>
          </Link>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            ⚡ x402 Payment Protocol
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            HTTP-native pay-per-use billing for agent services. No subscriptions, no billing dashboards — just usage and payment.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* What is x402 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-2xl">What is x402?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              x402 is an HTTP status code extension (402 Payment Required) that enables real-time, 
              micropayment-based access control. Instead of monthly subscriptions, users pay per request.
            </p>
            
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
              <div className="text-cyan-400 mb-2">The Flow:</div>
              <div className="space-y-1 text-foreground/70">
                <div>1. Agent makes request → Service checks balance</div>
                <div>2. If insufficient funds → <span className="text-red-400">402 Payment Required</span></div>
                <div>3. Agent deposits funds → Retries request</div>
                <div>4. Service deducts cost → <span className="text-green-400">200 OK</span> + result</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="font-semibold text-green-400 mb-2">✓ Benefits</div>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• No commitment — pay for what you use</li>
                  <li>• No surprise bills at month-end</li>
                  <li>• Perfect for agent-to-agent payments</li>
                  <li>• Aligns cost directly with value</li>
                  <li>• Works across organizational boundaries</li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="font-semibold text-amber-400 mb-2">⚠️ Trade-offs</div>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Requires payment infrastructure</li>
                  <li>• Less predictable revenue for providers</li>
                  <li>• Users need to monitor balances</li>
                  <li>• Not ideal for all-you-can-eat use cases</li>
                  <li>• Payment overhead per transaction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Implementation */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Implementation Guide</h2>
          
          {/* Server-Side */}
          <Card className="bg-card/30 border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🖥️</span>
                Server-Side: Responding with 402
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                When a request arrives, check the user's balance. If insufficient, return 402 with payment details.
              </p>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-300 mb-3">Node.js + Express Example:</p>
                <pre className="text-xs overflow-x-auto bg-black/60 p-4 rounded text-foreground/90">
{`import express from 'express';
import { checkBalance, deductBalance, getPaymentAddress } from './payment';

const app = express();

app.post('/api/agent/task', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const taskCost = 0.05; // $0.05 per task

  const balance = await checkBalance(userId);

  if (balance < taskCost) {
    return res.status(402).json({
      error: 'Payment Required',
      balance: balance,
      required: taskCost,
      shortfall: taskCost - balance,
      paymentAddress: await getPaymentAddress(userId),
      message: 'Insufficient balance. Please deposit funds to continue.'
    });
  }

  // Process the task
  const result = await processTask(req.body);

  // Deduct cost after successful processing
  await deductBalance(userId, taskCost);

  res.json({
    result,
    balanceRemaining: balance - taskCost
  });
});

app.listen(3000);`}
                </pre>
              </div>

              <div className="bg-black/40 rounded-lg p-4">
                <p className="text-sm font-semibold text-cyan-400 mb-2">💡 Best Practice:</p>
                <p className="text-sm text-foreground/80">
                  Always return the exact shortfall amount and a payment address. This allows clients 
                  to automatically top up without manual intervention.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client-Side */}
          <Card className="bg-card/30 border-[#06D6A0]/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                Client-Side: Handling 402 Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                When your agent receives a 402, automatically deposit funds and retry.
              </p>

              <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#06D6A0] mb-3">TypeScript Agent Example:</p>
                <pre className="text-xs overflow-x-auto bg-black/60 p-4 rounded text-foreground/90">
{`interface PaymentRequiredError {
  balance: number;
  required: number;
  shortfall: number;
  paymentAddress: string;
  message: string;
}

async function callAgentService(
  endpoint: string, 
  payload: any, 
  maxRetries = 1
): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': process.env.AGENT_USER_ID,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 402) {
      const error: PaymentRequiredError = await response.json();
      
      console.log(\`Payment required: \${error.message}\`);
      console.log(\`Current balance: $\${error.balance}\`);
      console.log(\`Shortfall: $\${error.shortfall}\`);

      if (maxRetries > 0) {
        // Auto-deposit the shortfall (plus buffer)
        const depositAmount = error.shortfall + 1.00; // $1 buffer
        await depositFunds(error.paymentAddress, depositAmount);
        
        console.log(\`Deposited $\${depositAmount}. Retrying...\`);
        
        // Wait for payment to clear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Retry the request
        return callAgentService(endpoint, payload, maxRetries - 1);
      }

      throw new Error(\`Insufficient funds: \${error.message}\`);
    }

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    return await response.json();
  } catch (error) {
    console.error('Agent service error:', error);
    throw error;
  }
}

// Usage
const result = await callAgentService(
  'https://api.example.com/api/agent/task',
  { task: 'analyze_data', data: {...} }
);`}
                </pre>
              </div>

              <div className="bg-black/40 rounded-lg p-4">
                <p className="text-sm font-semibold text-cyan-400 mb-2">💡 Pro Tip:</p>
                <p className="text-sm text-foreground/80">
                  Implement automatic top-up when balance drops below a threshold (e.g., $5). 
                  This prevents 402 errors from interrupting agent workflows.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Infrastructure */}
          <Card className="bg-card/30 border-cyan-500/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                Payment Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                x402 works with any payment system. Here are common approaches:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
                  <div className="font-semibold text-purple-400 mb-2">Crypto Wallets</div>
                  <p className="text-xs text-foreground/70 mb-3">
                    Lightning Network, Solana Pay, or Ethereum for instant micropayments
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="text-green-400">✓ Instant settlement</div>
                    <div className="text-green-400">✓ Low fees</div>
                    <div className="text-red-400">✗ Requires wallet</div>
                  </div>
                </div>

                <div className="bg-black/40 border border-[#06D6A0]/30 rounded-lg p-4">
                  <div className="font-semibold text-[#06D6A0] mb-2">Stripe Balance</div>
                  <p className="text-xs text-foreground/70 mb-3">
                    Pre-funded balance managed via Stripe Connect
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="text-green-400">✓ Familiar to users</div>
                    <div className="text-green-400">✓ Fiat currency</div>
                    <div className="text-red-400">✗ 2.9% + $0.30 fees</div>
                  </div>
                </div>

                <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
                  <div className="font-semibold text-cyan-400 mb-2">API Credits</div>
                  <p className="text-xs text-foreground/70 mb-3">
                    Purchase credit packs, use until depleted
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="text-green-400">✓ No per-tx fees</div>
                    <div className="text-green-400">✓ Simple accounting</div>
                    <div className="text-red-400">✗ Requires bulk buy</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-300 mb-3">Stripe Balance Example:</p>
                <pre className="text-xs overflow-x-auto bg-black/60 p-4 rounded text-foreground/90">
{`import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Check balance
async function checkBalance(userId: string): Promise<number> {
  const customer = await stripe.customers.retrieve(userId);
  return customer.balance / -100; // Stripe stores in cents, negative
}

// Deduct from balance
async function deductBalance(userId: string, amount: number) {
  await stripe.customers.createBalanceTransaction(userId, {
    amount: -Math.round(amount * 100), // Convert to cents, negative for deduction
    currency: 'usd',
    description: 'Agent service usage',
  });
}

// Top up balance (via charge)
async function topUpBalance(userId: string, amount: number) {
  const charge = await stripe.charges.create({
    customer: userId,
    amount: Math.round(amount * 100),
    currency: 'usd',
    description: 'Balance top-up',
  });

  // Credit the balance
  await stripe.customers.createBalanceTransaction(userId, {
    amount: Math.round(amount * 100),
    currency: 'usd',
    description: 'Balance credit from top-up',
  });
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Flow Diagram */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">x402 Flow Diagram</h2>
        
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Request Flow */}
              <div className="flex items-center gap-4">
                <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Agent
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#06D6A0] to-purple-500"></div>
                <div className="text-sm text-foreground/70">POST /api/task</div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Service
                </div>
              </div>

              {/* Check Balance */}
              <div className="flex items-center gap-4">
                <div className="w-[100px]"></div>
                <div className="flex-1 border-l-2 border-cyan-500/50 pl-4 py-2">
                  <div className="text-sm text-cyan-400 font-semibold">1. Check Balance</div>
                  <div className="text-xs text-foreground/60">balance = $0.02, required = $0.05</div>
                </div>
              </div>

              {/* 402 Response */}
              <div className="flex items-center gap-4">
                <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Agent
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <div className="text-sm text-red-400 font-semibold">402 Payment Required</div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-[#06D6A0]"></div>
                <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Service
                </div>
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-4">
                <div className="w-[100px]"></div>
                <div className="flex-1 border-l-2 border-[#06D6A0]/50 pl-4 py-2">
                  <div className="text-sm text-[#06D6A0] font-semibold">2. Deposit Funds</div>
                  <div className="text-xs text-foreground/60">amount = $1.03 (shortfall + buffer)</div>
                </div>
              </div>

              {/* Retry Request */}
              <div className="flex items-center gap-4">
                <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Agent
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#06D6A0] to-purple-500"></div>
                <div className="text-sm text-foreground/70">POST /api/task (retry)</div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Service
                </div>
              </div>

              {/* Process */}
              <div className="flex items-center gap-4">
                <div className="w-[100px]"></div>
                <div className="flex-1 border-l-2 border-cyan-500/50 pl-4 py-2">
                  <div className="text-sm text-cyan-400 font-semibold">3. Process Task</div>
                  <div className="text-xs text-foreground/60">Deduct $0.05 from balance</div>
                </div>
              </div>

              {/* Success Response */}
              <div className="flex items-center gap-4">
                <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Agent
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-green-500"></div>
                <div className="text-sm text-green-400 font-semibold">200 OK + Result</div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-[#06D6A0]"></div>
                <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-mono text-sm font-semibold whitespace-nowrap">
                  Service
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Comparison */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">x402 vs Traditional Billing</h2>
        
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                    <th className="text-left py-3 px-4 font-semibold text-cyan-400">x402 (Pay-Per-Use)</th>
                    <th className="text-left py-3 px-4 font-semibold text-purple-400">Traditional (Subscription)</th>
                  </tr>
                </thead>
                <tbody className="text-foreground/80">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Billing Frequency</td>
                    <td className="py-3 px-4">Per request</td>
                    <td className="py-3 px-4">Monthly/Annual</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Commitment</td>
                    <td className="py-3 px-4 text-green-400">None</td>
                    <td className="py-3 px-4 text-amber-400">Monthly minimum</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Cost Predictability</td>
                    <td className="py-3 px-4 text-amber-400">Variable (usage-based)</td>
                    <td className="py-3 px-4 text-green-400">Fixed (flat rate)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Setup Complexity</td>
                    <td className="py-3 px-4 text-amber-400">Medium (payment infra)</td>
                    <td className="py-3 px-4 text-green-400">Low (Stripe/Paddle)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Agent-to-Agent</td>
                    <td className="py-3 px-4 text-green-400">Perfect fit</td>
                    <td className="py-3 px-4 text-red-400">Awkward</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Churn Risk</td>
                    <td className="py-3 px-4 text-green-400">None (no subscription)</td>
                    <td className="py-3 px-4 text-amber-400">Yes (monthly decision)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Revenue Predictability</td>
                    <td className="py-3 px-4 text-amber-400">Low</td>
                    <td className="py-3 px-4 text-green-400">High (recurring)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Best For</td>
                    <td className="py-3 px-4">APIs, microservices, agent tools</td>
                    <td className="py-3 px-4">SaaS apps, recurring use</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* When to Use */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">When to Use x402</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-[#06D6A0]/5 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400">
                <span className="text-2xl">✓</span>
                Great Fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">▸</span>
                  <span><strong>API services:</strong> RESTful endpoints that agents call occasionally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">▸</span>
                  <span><strong>Agent tools:</strong> Specialized functions (image generation, data analysis)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">▸</span>
                  <span><strong>Cross-org payments:</strong> Agent from Company A using service from Company B</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">▸</span>
                  <span><strong>Micropayments:</strong> Costs under $1 per transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">▸</span>
                  <span><strong>Variable usage:</strong> Some agents use heavily, others rarely</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-amber-500/5 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-400">
                <span className="text-2xl">✗</span>
                Poor Fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">▸</span>
                  <span><strong>High-frequency use:</strong> Thousands of calls/day (overhead adds up)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">▸</span>
                  <span><strong>SaaS dashboards:</strong> Users expect all-access subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">▸</span>
                  <span><strong>Internal tools:</strong> Within same org, just use normal auth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">▸</span>
                  <span><strong>Enterprise contracts:</strong> They want predictable annual costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">▸</span>
                  <span><strong>Consumer products:</strong> Humans prefer subscriptions over tracking balances</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/30 border-[#06D6A0]/20 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              Hybrid Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 mb-4">
              Many successful agent services offer <strong>both</strong> models:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-lg p-4">
                <div className="font-semibold text-cyan-400 mb-2">Pay-As-You-Go (x402)</div>
                <p className="text-sm text-foreground/70">
                  For occasional use, testing, and agent-to-agent integrations. Deposit credits, use until depleted.
                </p>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="font-semibold text-purple-400 mb-2">Subscription Plans</div>
                <p className="text-sm text-foreground/70">
                  For heavy users who want predictable costs and premium features. Includes X credits/month, overage at lower rate.
                </p>
              </div>
            </div>
            <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-[#06D6A0]">
                <strong>Best of both worlds:</strong> Let users choose. Pay-as-you-go for flexibility, 
                subscription for committed users who want discounts and predictability.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Implement x402?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Review the code examples above and adapt them to your payment infrastructure. 
              Or explore other monetization models in our guide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/monetization/calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Calculate Your Pricing →
              </Link>
              <Link
                href="/monetization"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold text-sm hover:bg-cyan-500/20 transition-colors"
              >
                Back to Monetization Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
