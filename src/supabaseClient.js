import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// If the env vars aren't set (e.g. running locally before setup is finished),
// `supabase` is null and every shared-bank feature quietly no-ops so the app
// still works with the built-in bank and local uploads.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
