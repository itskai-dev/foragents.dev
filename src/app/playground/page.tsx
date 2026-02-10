import type { Metadata } from "next";

import PlaygroundClient from "./PlaygroundClient";

// NOTE: kept outside /src per task requirements.
import endpoints from "../../../data/api-endpoints.json";

type ApiEndpoint = {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  params: Array<{
    name: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    description?: string;
    in?: "path" | "query" | "body";
  }>;
};

export function generateMetadata(): Metadata {
  const title = "API Playground — forAgents.dev";
  const description = "Try forAgents.dev API endpoints interactively. Build requests, inspect headers, and view formatted responses.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://foragents.dev/playground",
    },
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/playground",
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type PlaygroundPageProps = {
  searchParams?: Promise<{
    endpoint?: string;
    path?: string;
    method?: string;
  }>;
};

export default async function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  const params = await searchParams;

  return (
    <PlaygroundClient
      endpoints={endpoints as ApiEndpoint[]}
      initialSelection={{
        endpoint: params?.endpoint,
        path: params?.path,
        method: params?.method,
      }}
    />
  );
}
