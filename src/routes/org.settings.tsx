import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { updateOrgSettings, type OrgSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/org/settings")({
  head: () => ({
    meta: [
      { title: "Settings | sidekik" },
      { name: "description", content: "Organisation settings for retention, languages and consent." },
      { property: "og:title", content: "Settings | sidekik" },
      { property: "og:description", content: "Organisation settings for retention, languages and consent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const DEFAULTS: OrgSettings = {
  retention_days: 30,
  languages: ["en", "de"],
  jev_enabled: true,
  store_learner_keyframes: false,
  consent_text_version: "v1",
};

function toSettings(raw: unknown): OrgSettings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<OrgSettings>;
  return {
    retention_days: typeof s.retention_days === "number" ? s.retention_days : DEFAULTS.retention_days,
    languages: Array.isArray(s.languages) ? s.languages.map(String) : DEFAULTS.languages,
    jev_enabled: typeof s.jev_enabled === "boolean" ? s.jev_enabled : DEFAULTS.jev_enabled,
    store_learner_keyframes: typeof s.store_learner_keyframes === "boolean" ? s.store_learner_keyframes : DEFAULTS.store_learner_keyframes,
    consent_text_version: typeof s.consent_text_version === "string" ? s.consent_text_version : DEFAULTS.consent_text_version,
  };
}

function SettingsPage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const isAdmin = membership?.role === "admin";
  const { data, isLoading, error } = useQuery({
    queryKey: ["org-settings", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from("orgs").select("name, settings").eq("id", orgId!).maybeSingle();
      if (error) throw error;
      return { name: data?.name ?? "", settings: toSettings(data?.settings) };
    },
  });
  const [form, setForm] = useState<OrgSettings>(DEFAULTS);
  const [langs, setLangs] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) { setForm(data.settings); setLangs(data.settings.languages.join(", ")); }
  }, [data]);

  if (!isAdmin) return <div className="p-8 text-sm text-muted-foreground">Only admins can view settings.</div>;
  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrgSettings({ ...form, languages: langs.split(",").map((l) => l.trim()).filter(Boolean) });
      toast.success("Settings saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">{data?.name}</p>
      <form onSubmit={onSave} className="mt-6 space-y-6 rounded-lg border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="retention">Retention (days)</Label>
          <Input id="retention" type="number" min={1} value={form.retention_days} onChange={(e) => setForm({ ...form, retention_days: Number(e.target.value) })} className="w-32" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="langs">Languages</Label>
          <Input id="langs" value={langs} onChange={(e) => setLangs(e.target.value)} placeholder="en, de, cs" />
          <p className="text-xs text-muted-foreground">Comma-separated language codes.</p>
        </div>
        <div className="flex items-center justify-between">
          <div><Label htmlFor="jev">Jev decisions</Label><p className="text-xs text-muted-foreground">Use Jev to gate when Sidekik asks questions.</p></div>
          <Switch id="jev" checked={form.jev_enabled} onCheckedChange={(v) => setForm({ ...form, jev_enabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label htmlFor="kf">Store learner keyframes</Label><p className="text-xs text-muted-foreground">Keep screenshots from practice sessions.</p></div>
          <Switch id="kf" checked={form.store_learner_keyframes} onCheckedChange={(v) => setForm({ ...form, store_learner_keyframes: v })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="consent">Consent text version</Label>
          <Input id="consent" value={form.consent_text_version} onChange={(e) => setForm({ ...form, consent_text_version: e.target.value })} className="w-32" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
      </form>
    </div>
  );
}
