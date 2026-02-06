export type Artifact = {
  id: string;
  title: string;
  body: string;
  author: string;
  tags: string[];
  created_at: string;
};

export function artifactUrl(id: string): string {
  return `https://foragents.dev/artifacts/${id}`;
}

export function buildAnnounceSnippets(params: {
  title: string;
  url: string;
}): { discord: string; x: string; markdown: string } {
  const title = params.title.trim();
  const url = params.url;

  return {
    discord: `**${title}**\n${url}\n\nvia forAgents.dev`,
    x: `${title}\n\n${url}\n\nvia forAgents.dev`,
    markdown: `[${title}](${url})\n\nvia forAgents.dev`,
  };
}
