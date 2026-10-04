import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workflows/$id")({
  head: () => ({
    meta: [
      { title: "Workflow | sidekik" },
      { name: "description", content: "Work Map versions and recent sessions for this workflow." },
      { property: "og:title", content: "Workflow | sidekik" },
      { property: "og:description", content: "Work Map versions and recent sessions for this workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkflowDetail,
});

function WorkflowDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const [wf, maps, sessions] = await Promise.all([
        supabase.from("workflows").select("id, name, description, onet_code, current_workmap_id").eq("id", id).maybeSingle(),
        supabase.from("work_maps").select("id, version, status, language, published_at, created_at").eq("workflow_id", id).order("version", { ascending: false }),
        supabase.from("sessions").select("id, kind, mode, phase, language, started_at, ended_at").eq("workflow_id", id).order("started_at", { ascending: false }).limit(20),
      ]);
      if (wf.error) throw wf.error;
      return { workflow: wf.data, maps: maps.data ?? [], sessions: sessions.data ?? [] };
    },
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data?.workflow) return <div className="p-8 text-sm">Workflow not found.</div>;
  const { workflow, maps, sessions } = data;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link to="/workflows" className="text-sm text-muted-foreground hover:underline">← Workflows</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{workflow.name}</h1>
      {workflow.description && <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>}

      <h2 className="mt-8 text-lg font-semibold">Work Map versions</h2>
      <div className="mt-3 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr><th className="px-4 py-2">Version</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Language</th><th className="px-4 py-2">Published</th></tr>
          </thead>
          <tbody>
            {maps.length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-muted-foreground">No Work Maps yet.</td></tr>}
            {maps.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2 font-medium">
                  v{m.version}{m.id === workflow.current_workmap_id && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">current</span>}
                </td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2">{m.language}</td>
                <td className="px-4 py-2 text-muted-foreground">{m.published_at ? new Date(m.published_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent sessions</h2>
      <div className="mt-3 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr><th className="px-4 py-2">Kind</th><th className="px-4 py-2">Mode</th><th className="px-4 py-2">Phase</th><th className="px-4 py-2">Started</th><th className="px-4 py-2">Ended</th></tr>
          </thead>
          <tbody>
            {sessions.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-muted-foreground">No sessions yet.</td></tr>}
            {sessions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2 font-medium">{s.kind}</td>
                <td className="px-4 py-2">{s.mode}</td>
                <td className="px-4 py-2">{s.phase}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(s.started_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.ended_at ? new Date(s.ended_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
