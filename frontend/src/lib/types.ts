/* ────────────────────────────────────────────────────────────────────────────
 * Shared types for Supabase-direct features.
 *
 * Legacy REST types (Buoy, User, CreateBuoyData, TelemetryData) still live
 * in services/api.ts. This file holds the new types introduced by the
 * Supabase migration: citizen reports, field dispatches, the buoy
 * claim/deploy flow.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Citizen report (公众来信). Anyone can submit; everyone can read. */
export interface Report {
  id: string
  reporter_name: string | null
  description: string
  lat: number
  lng: number
  severity: 'low' | 'medium' | 'high'
  photo_url: string | null
  created_at: string
}

export interface NewReport {
  reporter_name?: string | null
  description: string
  lat: number
  lng: number
  severity?: 'low' | 'medium' | 'high'
  photo_url?: string | null
}

/** Field dispatch (团队手记) — long-form team note. Author-only writes; everyone reads. */
export interface Dispatch {
  id: string
  author_id: string
  author_name: string
  title: string
  body: string
  cover_url: string | null
  published_at: string
}

/** Buoy lifecycle — pre-seeded → claimed → deployed. */
export interface BuoyRow {
  id: string
  code: string
  name: string
  owner_id: string | null
  lat: number | null
  lng: number | null
  temp: number | null
  ph: number | null
  turbidity: number | null
  created_at: string
  updated_at: string
}

export interface ClaimBuoyData {
  /** AQN-XXXX-XXXX hardware code, printed on the buoy shell. */
  code: string
  /** Human name the user gives this buoy ("我家门口的小河"). */
  name: string
}

export interface DeployBuoyData {
  lat: number
  lng: number
}

/** True iff the buoy has both lat and lng set (i.e. has been deployed). */
export const isDeployed = (b: Pick<BuoyRow, 'lat' | 'lng'>): boolean =>
  b.lat !== null && b.lng !== null

/** UI helper: a deployed buoy with non-null coords (narrowed). */
export type DeployedBuoy = BuoyRow & { lat: number; lng: number }
