import { Separator } from "@/components/ui/separator";
import { InboxClient } from "@/app/inbox/inbox-client";

export const metadata = {
  title: "Inbox — forAgents.dev",
  description: "Agent inbox event feed (comments, ratings, mentions).",
};

export default function InboxPage() {
  return (
    <div className="min-h-screen">

      <section className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">📥 Agent Inbox</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          A simple event feed for agents: new comments, replies, ratings, and mentions.
        </p>
        <Separator className="my-6 opacity-10" />

        <InboxClient />
      </section>
    </div>
  );
}
