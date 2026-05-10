import { api, type Buoy, type CreateBuoyData } from './api'
import { supabase } from '../utils/supabase/client'
import type { BuoyRow } from '../lib/types'

/**
 * Get all deployed buoys (public, no auth required).
 *
 * Reads directly from Supabase via the publishable anon key — no Express
 * backend in the loop. RLS policy `buoys_select_all` permits anonymous
 * SELECT on every row. We filter to deployed buoys (lat & lng set) so the
 * Leaflet map doesn't choke on null coordinates.
 *
 * Telemetry fields are nullable in the schema; we coerce nulls to 0 so the
 * existing non-nullable Buoy type stays usable. If you need to distinguish
 * "0 reading" from "no reading", refactor Buoy to allow nulls and update
 * MapPage's tooltip rendering.
 */
export const getAllBuoys = async (): Promise<Buoy[]> => {
  const { data, error } = await supabase
    .from('buoys')
    .select('id, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`加载浮标数据失败 · Failed to load buoys: ${error.message}`)
  }

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
 *
 * Use this when the consumer needs to distinguish "no reading" from "0".
 * The map popup uses it; the legacy `getAllBuoys` above still coerces nulls
 * to 0 for the older Buoy type.
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

// Get buoy by ID
export const getBuoyById = async (id: string): Promise<Buoy> => {
  return await api.getBuoyById(id)
}

// Get user's buoys (authenticated)
export const getBuoysByOwner = async (ownerId: string): Promise<Buoy[]> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  const buoys = await api.getMyBuoys(token)
  return buoys.filter(b => b.owner_id === ownerId)
}

// Create new buoy
export const createBuoy = async (data: CreateBuoyData): Promise<string> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  const buoy = await api.createBuoy(token, data)
  return buoy.id
}

// Update buoy
export const updateBuoy = async (id: string, data: Partial<Buoy>): Promise<Buoy> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  return await api.updateBuoy(token, id, data)
}

// Delete buoy
export const deleteBuoy = async (id: string): Promise<void> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  await api.deleteBuoy(token, id)
}

// Update telemetry data (for buoy devices to send data)
export const updateTelemetry = async (
  buoyId: string,
  data: { temp?: number; ph?: number; turbidity?: number }
): Promise<Buoy> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  return await api.updateTelemetry(token, buoyId, data)
}
