export interface ApiHealthResponse {
  status: "ok" | "degraded";
  apis: Record<string, boolean>;
  timestamp: string;
}
