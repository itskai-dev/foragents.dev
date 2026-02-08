import { TraceClient } from "@/app/trace/trace-client";

export const metadata = {
  title: "Trace Viewer — forAgents.dev",
  description: "Inspect a single agent run as a timeline.",
};

export default async function TracePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const sp = (await searchParams) || {};
  const initialId = typeof sp.id === "string" && sp.id.trim() ? sp.id.trim() : "demo";

  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Agent Trace <span className="aurora-text">Viewer</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Render a single agent run as a timeline of tool calls, LLM responses, and errors.
          </p>
        </div>

        <TraceClient initialId={initialId} />
      </div>
    </main>
  );
}
