import { supabase } from '../utils/supabase/client'
import type { Report, NewReport } from '../lib/types'

/**
 * Citizen reports service · 公众来信
 *
 * Public read + public insert (RLS allows both for anon role). No auth
 * needed for the bulletin's "letters from the public" feature.
 */

export async function listReports(limit = 60): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, reporter_name, description, lat, lng, severity, photo_url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`加载来信失败 · Load reports: ${error.message}`)
  return (data ?? []) as Report[]
}

export async function submitReport(input: NewReport): Promise<Report> {
  const payload = {
    reporter_name: input.reporter_name?.trim() || null,
    description: input.description.trim(),
    lat: input.lat,
    lng: input.lng,
    severity: input.severity ?? 'medium',
    photo_url: input.photo_url ?? null,
  }

  const { data, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('id, reporter_name, description, lat, lng, severity, photo_url, created_at')
    .single()

  if (error) throw new Error(`提交来信失败 · Submit report: ${error.message}`)
  return data as Report
}
