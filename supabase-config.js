// =========================================================
// Learn With Rinkesh — Supabase connection
//
// Replace the two values below with YOUR OWN Supabase project's
// URL and anon (public) key. Find them in:
// Supabase Dashboard → Project Settings → Data API
//
// The anon key is SAFE to put here / expose publicly — it only
// works within the security rules (RLS policies) we set up in
// setup.sql. It cannot bypass those rules.
// =========================================================

const SUPABASE_URL = "https://sufmdxzkuzpfkaxdgiim.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZDMTOwO3uXjayZv31814VQ_wfqa6zOQ";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
