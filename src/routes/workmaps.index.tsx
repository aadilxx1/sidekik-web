import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/workmaps/")({
  head: () => ({
    meta: [
      { title: "Work Maps | sidekik" },
      { name: "description", content: "Work Maps captured from your experts." },
      { property: "og:title", content: "Work Maps | sidekik" },
      { property: "og:description", content: "Work Maps captured from your experts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkMapsPage,
});

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_debrief: "In debrief",
  confirmed: "Confirmed",
  published: "Published",
  retired: "Retired",
};

function WorkMapsPage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const { data, isLoading, error } = useQuery({
    queryKey: ["workmaps", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_maps")
        .select(
          "id, version, status, language, published_at, created_at, workflows!work_maps_workflow_id_fkey(name), experts(display_name)",
        )
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Work Maps</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each one is a confirmed, evidence-linked map of how an expert does a workflow.
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Workflow</th>
              <th className="px-4 py-2">Expert</th>
              <th className="px-4 py-2">Version</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-destructive">
                  {(error as Error).message}
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  No Work Maps yet. Run a capture session to create one.
                </td>
              </tr>
            )}
            {data?.map((m) => {
              const workflow = m.workflows as unknown as { name: string } | null;
              const expert = m.experts as unknown as { display_name: string } | null;
              return (
                <tr key={m.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-2 font-medium">
                    <Link
                      to="/workmaps/$id"
                      params={{ id: m.id }}
                      className="text-primary hover:underline"
                    >
                      {workflow?.name ?? "Untitled workflow"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{expert?.display_name ?? "—"}</td>
                  <td className="px-4 py-2">v{m.version}</td>
                  <td className="px-4 py-2">{STATUS_LABEL[m.status] ?? m.status}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {m.published_at ? new Date(m.published_at).toLocaleDateString() : "—"}
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
