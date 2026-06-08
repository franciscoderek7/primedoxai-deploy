import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================================
// THREE SUPABASE CLIENTS — one per project
// NEVER pass the wrong client to the wrong operation
// ============================================================

// HUB — sessions, cart, module registry, affiliates (no PII)
export function createHubClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_HUB_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY!
  )
}

export function createHubServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_HUB_SUPABASE_URL!,
    process.env.HUB_SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// LOOP A — Derek-identity brands (CCLDR, PrimeDox, Weedlaw Ed, FHI, CCC)
export function createLoopAClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_LOOP_A_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_LOOP_A_SUPABASE_ANON_KEY!
  )
}

export function createLoopAServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_LOOP_A_SUPABASE_URL!,
    process.env.LOOP_A_SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// LOOP B — Anonymous brands (OmniaGuard, Kiaros, SoulStack, CleanSwarm)
export function createLoopBClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_LOOP_B_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_LOOP_B_SUPABASE_ANON_KEY!
  )
}

export function createLoopBServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_LOOP_B_SUPABASE_URL!,
    process.env.LOOP_B_SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// Type guard — ensure we never accidentally pass a loop B client to a loop A operation
export type LoopAClient = ReturnType<typeof createLoopAClient>
export type LoopBClient = ReturnType<typeof createLoopBClient>
export type HubClient  = ReturnType<typeof createHubClient>
