import type { BuoyRow } from '../lib/types'
import { supabase } from '../utils/supabase/client'

/**
 * Export service · CSV downloads of the buoy fleet snapshot.
 *
 * Reads the current state of every deployed buoy (including telemetry that
 * may be null) and turns it into a CSV the user can save locally. There's
 * no historical readings table in the schema yet, so this is a snapshot —
 * not a time series. The UI presents it as "今日水况下载".
 */

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',')
}

export async function fetchDeployedBuoysSnapshot(): Promise<BuoyRow[]> {
  const { data, error } = await supabase
    .from('buoys')
    .select('id, code, name, owner_id, lat, lng, temp, ph, turbidity, created_at, updated_at')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`下载失败 · Snapshot fetch: ${error.message}`)
  return (data ?? []) as BuoyRow[]
}

export function buoysToCsv(rows: BuoyRow[]): string {
  const header = [
    'id',
    'code',
    'name',
    'lat',
    'lng',
    'temp_c',
    'ph',
    'turbidity_ntu',
    'last_updated_iso',
  ]
  const body = rows.map((r) =>
    toCsvRow([
      r.id,
      r.code,
      r.name,
      r.lat ?? '',
      r.lng ?? '',
      r.temp ?? '',
      r.ph ?? '',
      r.turbidity ?? '',
      r.updated_at,
    ]),
  )
  return [header.join(','), ...body].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function todayStamp(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function downloadFleetSnapshot(): Promise<{ rows: number; filename: string }> {
  const rows = await fetchDeployedBuoysSnapshot()
  const csv = buoysToCsv(rows)
  const filename = `aquanet-fleet-snapshot-${todayStamp()}.csv`
  downloadCsv(filename, csv)
  return { rows: rows.length, filename }
}

export function downloadSingleBuoyCsv(b: BuoyRow): void {
  const csv = buoysToCsv([b])
  const filename = `aquanet-${b.code || b.id.slice(0, 8)}-${todayStamp()}.csv`
  downloadCsv(filename, csv)
}
