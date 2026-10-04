import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Read-only, untyped access until the generated Supabase types include the backend's tables.
export const db = supabase as unknown as SupabaseClient;
