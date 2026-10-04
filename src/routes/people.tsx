import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { invitePerson, type PersonKind } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People | sidekik" },
      { name: "description", content: "Experts and learners in your organisation." },
      { property: "og:title", content: "People | sidekik" },
      { property: "og:description", content: "Experts and learners in your organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const isAdmin = membership?.role === "admin";
  const { data, isLoading, error } = useQuery({
    queryKey: ["people", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [experts, learners] = await Promise.all([
        supabase.from("experts").select("id, display_name, language, onet_code, user_id, created_at").eq("org_id", orgId!).order("display_name"),
        supabase.from("learners").select("id, display_name, language, user_id, created_at").eq("org_id", orgId!).order("display_name"),
      ]);
      if (experts.error) throw experts.error;
      if (learners.error) throw learners.error;
      return { experts: experts.data, learners: learners.data };
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">People</h1>
      {isAdmin && <InviteForm />}
      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}
      {data && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <PeopleList title="Experts" rows={data.experts.map((e) => ({ ...e, extra: e.onet_code }))} />
          <PeopleList title="Learners" rows={data.learners.map((l) => ({ ...l, extra: null }))} />
        </div>
      )}
    </div>
  );
}

function PeopleList({ title, rows }: { title: string; rows: { id: string; display_name: string; language: string; user_id: string | null; extra: string | null }[] }) {
  return (
    <section className="rounded-lg border">
      <h2 className="border-b px-4 py-2 text-sm font-semibold">{title} <span className="text-muted-foreground">({rows.length})</span></h2>
      <ul className="divide-y text-sm">
        {rows.length === 0 && <li className="px-4 py-3 text-muted-foreground">None yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between px-4 py-2">
            <span className="font-medium">{r.display_name}</span>
            <span className="text-xs text-muted-foreground">
              {r.language.toUpperCase()}{r.extra ? ` · ${r.extra}` : ""}{r.user_id ? "" : " · invited"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function InviteForm() {
  const [kind, setKind] = useState<PersonKind>("learner");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await invitePerson({ kind, email, display_name: name, language });
      setEmail(""); setName("");
      toast.success("Invite sent");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }
  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-center gap-2">
      <select value={kind} onChange={(e) => setKind(e.target.value as PersonKind)} className="h-9 rounded-md border bg-background px-2 text-sm">
        <option value="learner">Learner</option>
        <option value="expert">Expert</option>
      </select>
      <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-40" />
      <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-56" />
      <Input required value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Lang" className="w-20" />
      <Button type="submit">Invite</Button>
    </form>
  );
}
