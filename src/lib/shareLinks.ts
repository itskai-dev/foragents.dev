export type ShareLinks = {
  quickstart: string;
  register: string;
  digest: string;
  feed: string;
};

export const SHARE_LINKS: ShareLinks = {
  quickstart: "/api/quickstart.md",
  register: "/api/register",
  digest: "/api/digest.json",
  feed: "/feeds/artifacts.json",
};
