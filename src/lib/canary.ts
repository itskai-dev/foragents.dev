export type CanaryStatus = "pass" | "fail";

export type CanaryHttpMethod = "GET";

export interface CanaryResult {
  id: string;
  checkedAt: string; // ISO timestamp
  endpoint: string; // path (e.g. "/api/skills")
  method: CanaryHttpMethod;
  status: CanaryStatus;
  httpStatus?: number;
  responseTimeMs: number;
  errorMessage?: string;
  regression?: boolean;
}
