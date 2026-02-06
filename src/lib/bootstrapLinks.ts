export type BootstrapShare = {
  /** Canonical agent-shareable bootstrap doc (markdown). */
  bootstrap: string;
};

export const BOOTSTRAP_SHARE: BootstrapShare = {
  bootstrap: "/api/bootstrap.md",
};
