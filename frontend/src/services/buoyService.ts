import type { Buoy } from './api'
import { supabase } from '../utils/supabase/client'
import type { BuoyRow } from '../lib/types'

/**
 * buoyService — direct Supabase access for buoy data.
 *
 * The legacy Express backend (REST + JWT in localStorage) has been removed.
 * Auth is owned by Supabase, so every write here is RLS-gated:
 *   - SELECT: public on every row (`buoys_select_all`)
 *   - UPDATE: owner can change their own row; anyone authenticated can
 *     claim a row where `owner_id IS NULL` (`buoys_claim_unclaimed`)
 *   - INSERT: admin-only (devices are pre-provisioned with claim codes)
 */

/* ── Public read paths ────────────────────────────────────────────────── */

/**
 * Get all deployed buoys with the legacy `Buoy` shape (nulls coerced to 0).
 * Kept for any consumer that hasn't migrated to BuoyRow yet.
 */
export const getAllBuoys = async (): Promise<Buoy[]> => {
  const { data, error } = await supabase
    .from('buoys')
    .select('id, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`加载浮标数据失败 · ${error.message}`)

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    owner_id: b.owner_id ?? '',
    lat: Number(b.lat),
    lng: Number(b.lng),
    temp: b.temp == null ? 0 : Number(b.temp),
    ph: b.ph == null ? 0 : Number(b.ph),
    turbidity: b.turbidity == null ? 0 : Number(b.turbidity),
    created_at: b.created_at ?? undefined,
    updated_at: b.updated_at ?? undefined,
  })) as Buoy[]
}

/**
 * Get deployed buoys with full BuoyRow shape (nullable telemetry preserved).
 * The map popup uses this so it can render `—` for missing readings.
 */
export const getDeployedBuoys = async (): Promise<BuoyRow[]> => {
  const { data, error } = await supabase
    .from('buoys')
    .select('id, code, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`加载浮标数据失败 · ${error.message}`)
  return (data ?? []) as BuoyRow[]
}

/* ── Owner read path (authenticated) ──────────────────────────────────── */

/**
 * List buoys owned by the current user. Includes both deployed and
 * undeployed (claimed but coords not yet set) rows. RLS scopes the result
 * to `owner_id = auth.uid()` automatically when a session is present.
 */
export const listMyBuoys = async (): Promise<BuoyRow[]> => {
  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user.id
  if (!uid) throw new Error('未登录 · Not authenticated')

  const { data, error } = await supabase
    .from('buoys')
    .select('id, code, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`加载我的设备失败 · ${error.message}`)
  return (data ?? []) as BuoyRow[]
}

/* ── Owner write paths ────────────────────────────────────────────────── */

/**
 * Claim an unclaimed buoy by its physical code (e.g. AQN-TEST-0001).
 *
 * The DB enforces `owner_id IS NULL` via the `buoys_claim_unclaimed`
 * RLS policy. If the row is already claimed, the UPDATE matches zero rows
 * and we surface a clear bilingual error to the UI.
 */
export const claimBuoyByCode = async (
  code: string,
  name: string,
): Promise<BuoyRow> => {
  const trimmedCode = code.trim()
  const trimmedName = name.trim()
  if (!trimmedCode) throw new Error('请填写设备码 · Code required')
  if (!trimmedName) throw new Error('请给设备起个名字 · Name required')

  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user.id
  if (!uid) throw new Error('未登录 · Not authenticated')

  const { data, error } = await supabase
    .from('buoys')
    .update({ owner_id: uid, name: trimmedName })
    .eq('code', trimmedCode)
    .is('owner_id', null)
    .select('id, code, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .maybeSingle()

  if (error) throw new Error(`认领失败 · ${error.message}`)
  if (!data) {
    throw new Error('找不到这个设备码，或者已经被别人认领了 · Code unknown or already claimed')
  }

  return data as BuoyRow
}

/**
 * Set the deployed location for a buoy you own.
 * RLS allows this when `owner_id = auth.uid()`.
 */
export const deployBuoy = async (
  id: string,
  lat: number,
  lng: number,
): Promise<BuoyRow> => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('坐标无效 · Invalid coordinates')
  }
  if (lat < -90 || lat > 90) throw new Error('纬度需在 -90 到 90 之间')
  if (lng < -180 || lng > 180) throw new Error('经度需在 -180 到 180 之间')

  const { data, error } = await supabase
    .from('buoys')
    .update({ lat, lng })
    .eq('id', id)
    .select('id, code, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .single()

  if (error) throw new Error(`部署失败 · ${error.message}`)
  return data as BuoyRow
}

/**
 * Release a buoy back to the unclaimed pool. Clears owner_id and coords
 * so it can be reclaimed by someone else (or redeployed elsewhere).
 */
export const releaseBuoy = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('buoys')
    .update({ owner_id: null, lat: null, lng: null })
    .eq('id', id)

  if (error) throw new Error(`释放失败 · ${error.message}`)
}
