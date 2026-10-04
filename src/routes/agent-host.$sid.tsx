import { createFileRoute } from "@tanstack/react-router";
import { useAgentHost, type AgentHostStatus } from "@/hooks/useAgentHost";
import { Wordmark } from "@/components/AppShell";

type AgentHostSearch = { t?: string };

export const Route = createFileRoute("/agent-host/$sid")({
  validateSearch: (search: Record<string, unknown>): AgentHostSearch =>
    typeof search["t"] === "string" ? { t: search["t"] } : {},
  head: () => ({
    meta: [
      { title: "Sidekik agent host" },
      { name: "description", content: "Sidekik meeting tile: the live agent status shown into the call." },
      { property: "og:title", content: "Sidekik agent host" },
      { property: "og:description", content: "Sidekik meeting tile: the live agent status shown into the call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgentHostPage,
});

const STATUS_LABEL: Record<AgentHostStatus, string> = {
  connecting: "Connecting",
  listening: "Listening",
  asking: "Asking",
  offrecord: "OFF THE RECORD",
};

function AgentHostPage() {
  const { sid } = Route.useParams();
  const { t } = Route.useSearch();
  const { status, error } = useAgentHost(sid, t);

  const offRecord = status === "offrecord";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div
        className="relative flex w-full max-w-[1280px] flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-sm"
        style={{ aspectRatio: "16 / 9" }}
      >
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <Wordmark />
            <div className="relative mt-10 flex h-40 w-40 items-center justify-center">
              <span
                className={`absolute inset-0 rounded-full border-2 ${
                  offRecord ? "border-destructive" : "border-primary"
                } animate-ping opacity-40`}
              />
              <span
                className={`absolute inset-4 rounded-full border-2 ${
                  offRecord ? "border-destructive" : "border-primary"
                } ${status === "connecting" ? "opacity-40" : "opacity-100"}`}
              />
              <span
                className={`relative rounded-full px-3 py-1 text-sm font-semibold tracking-wide ${
                  offRecord ? "bg-destructive text-destructive-foreground" : "text-foreground"
                }`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
          </>
        )}
        <p className="absolute bottom-6 text-xs text-muted-foreground">
          Recording with consent · say 'off the record' to pause
        </p>
      </div>
    </div>
  );
}
