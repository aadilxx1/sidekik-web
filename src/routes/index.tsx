import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSession, type SessionKind } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | sidekik" },
      { name: "description", content: "Your Sidekik home: start a capture, start practice, or see your organisation at a glance." },
      { property: "og:title", content: "Home | sidekik" },
      { property: "og:description", content: "Your Sidekik home: start a capture, start practice, or see your organisation at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const { membership } = useAuth();
  if (!membership) return null;
  return (
    <div className="mx-auto max-w-5xl p-8">
      {membership.role === "admin" || membership.role === "manager" ? (
        <AdminDashboard orgId={membership.orgId} />
      ) : membership.role === "expert" ? (
        <StartCard orgId={membership.orgId} kind="capture" title="Start capture" body="Share your screen and do the task as usual. Sidekik asks about your decisions." />
      ) : (
        <StartCard orgId={membership.orgId} kind="tutor" title="Start practice" body="Practise a workflow with Sidekik, guided by the expert's own words." />
      )}
    </div>
  );
}

const TABLES = [
  { table: "workflows", label: "Workflows" },
  { table: "sessions", label: "Sessions" },
  { table: "work_maps", label: "Work maps" },
] as const;

function AdminDashboard({ orgId }: { orgId: string }) {
  const { data } = useQuery({
    queryKey: ["dashboard-counts", orgId],
    queryFn: async () =>
      Promise.all(
        TABLES.map(async ({ table }) => {
          const { count } = await db.from(table).select("id", { count: "exact", head: true }).eq("org_id", orgId);
          return count ?? 0;
        }),
      ),
  });
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {TABLES.map((t, i) => (
          <div key={t.table} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{data ? data[i] : "–"}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function StartCard({ orgId, kind, title, body }: { orgId: string; kind: SessionKind; title: string; body: string }) {
  const navigate = useNavigate();
  const [workflowId, setWorkflowId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows", orgId],
    queryFn: async () => {
      const { data } = await db.from("workflows").select("id, name").eq("org_id", orgId).order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });
  const selected = workflowId || workflows[0]?.id || "";

  const start = async () => {
    setError(null);
    setBusy(true);
    try {
      const { session_id } = await createSession({ workflow_id: selected, kind });
      navigate({ to: kind === "capture" ? "/capture/$sid" : "/tutor/$sid", params: { sid: session_id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the session");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md rounded-lg border border-border bg-card p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <label className="mt-5 block text-xs font-medium text-muted-foreground">Workflow</label>
      <select
        value={selected}
        onChange={(e) => setWorkflowId(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {workflows.length === 0 && <option value="">No workflows yet</option>}
        {workflows.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button
        onClick={start}
        disabled={!selected || busy}
        className="mt-5 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Starting…" : title}
      </button>
    </div>
  );
}
