import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

export type Role = "admin" | "expert" | "learner" | "manager";

export interface Membership {
  orgId: string;
  orgName: string;
  role: Role;
}

interface AuthState {
  ready: boolean;
  session: Session | null;
  membership: Membership | null;
  membershipLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function loadMembership(userId: string): Promise<Membership | null> {
  const { data: m } = await db.from("org_members").select("org_id, role").eq("user_id", userId).limit(1).maybeSingle();
  if (!m) return null;
  const { data: org } = await db.from("orgs").select("name").eq("id", m.org_id).maybeSingle();
  return { orgId: m.org_id as string, role: m.role as Role, orgName: (org?.name as string | undefined) ?? "Organisation" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setMembership(null);
      return;
    }
    let cancelled = false;
    setMembershipLoading(true);
    loadMembership(userId)
      .then((m) => !cancelled && setMembership(m))
      .finally(() => !cancelled && setMembershipLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ready, session, membership, membershipLoading, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
