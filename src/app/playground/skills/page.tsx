import type { Metadata } from "next";

import SkillsPlaygroundClient from "./SkillsPlaygroundClient";

import skills from "@/data/skills.json";
import templates from "@/data/playground-configs.json";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

type PlaygroundTemplate = {
  id: string;
  name: string;
  description?: string;
  skillSlug: string;
  model: string;
  parameters: Record<string, string>;
  env: Record<string, string>;
};

export function generateMetadata(): Metadata {
  const title = "Skill Playground — forAgents.dev";
  const description =
    "Pick a skill, configure model + parameters + env vars, and run a realistic streaming execution simulation.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://foragents.dev/playground/skills",
    },
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/playground/skills",
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

export default function SkillsPlaygroundPage() {
  return (
    <SkillsPlaygroundClient
      skills={skills as Skill[]}
      templates={templates as unknown as PlaygroundTemplate[]}
    />
  );
}
