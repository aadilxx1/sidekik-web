import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/sessions/")({
  head: () => ({
    meta: [
      { title: "Sessions | sidekik" },
      { name: "description", content: "Capture and tutor sessions with their timelines." },
      { property: "og:title", content: "Sessions | sidekik" },
      { property: "og:description", content: "Capture and tutor sessions with their timelines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SessionsPage,
});

function duration(start: string, end: string | null): string {
  if (!end) return "running";
  const mins = Math.round((Date.parse(end) - Date.parse(start)) / 60_000);
  return `${mins} min`;
}

function SessionsPage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "id, kind, mode, phase, started_at, ended_at, workflows(name), experts(display_name), learners(display_name)",
        )
        .eq("org_id", orgId!)
        .order("started_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Started</th>
              <th className="px-4 py-2">Kind</th>
              <th className="px-4 py-2">Workflow</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Phase</th>
              <th className="px-4 py-2">Length</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-destructive">
                  {(error as Error).message}
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                  No sessions yet.
                </td>
              </tr>
            )}
            {data?.map((s) => {
              const workflow = s.workflows as unknown as { name: string } | null;
              const expert = s.experts as unknown as { display_name: string } | null;
              const learner = s.learners as unknown as { display_name: string } | null;
              return (
                <tr key={s.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-2">
                    <Link
                      to="/sessions/$id"
                      params={{ id: s.id }}
                      className="text-primary hover:underline"
                    >
                      {new Date(s.started_at).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {s.kind}
                    {s.mode !== "browser" && (
                      <span className="ml-1 text-xs text-muted-foreground">({s.mode})</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{workflow?.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    {(s.kind === "tutor" ? learner : expert)?.display_name ?? "—"}
                  </td>
                  <td className="px-4 py-2">{s.phase}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {duration(s.started_at, s.ended_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
