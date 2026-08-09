// STUB — Supabase server client placeholder
// Replace with real client when Supabase is restored
import { createClient } from '@supabase/supabase-js'

export function createHubServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = createHubServerClient()
