import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { createWorkflow } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: [
      { title: "Workflows | sidekik" },
      { name: "description", content: "Workflows your organisation captures and teaches." },
      { property: "og:title", content: "Workflows | sidekik" },
      { property: "og:description", content: "Workflows your organisation captures and teaches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const canEdit = membership?.role === "admin" || membership?.role === "expert";
  const [name, setName] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["workflows", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("id, name, description, onet_code, current_workmap_id, created_at")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createWorkflow({ name: name.trim() });
      setName("");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
      {canEdit && (
        <form onSubmit={onCreate} className="mt-4 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New workflow name" className="max-w-sm" />
          <Button type="submit">Add workflow</Button>
        </form>
      )}
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Description</th><th className="px-4 py-2">Work Map</th><th className="px-4 py-2">Created</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {error && <tr><td colSpan={4} className="px-4 py-6 text-destructive">{(error as Error).message}</td></tr>}
            {data?.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-muted-foreground">No workflows yet.</td></tr>}
            {data?.map((w) => (
              <tr key={w.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2 font-medium">
                  <Link to="/workflows/$id" params={{ id: w.id }} className="text-primary hover:underline">{w.name}</Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{w.description ?? "—"}</td>
                <td className="px-4 py-2">{w.current_workmap_id ? "Published" : "None"}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
