import { supabase } from '../utils/supabase/client'
import type { Dispatch } from '../lib/types'

/**
 * Field dispatches service · 团队手记
 *
 * Read-only client. Public SELECT is allowed by RLS — anyone can read
 * the team's field notes. Writes go through a separate authenticated
 * flow that's not part of the public bulletin UI.
 */

export async function listDispatches(limit = 30): Promise<Dispatch[]> {
  const { data, error } = await supabase
    .from('dispatches')
    .select('id, author_id, author_name, title, body, cover_url, published_at')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`加载手记失败 · Load dispatches: ${error.message}`)
  return (data ?? []) as Dispatch[]
}

export async function getDispatchById(id: string): Promise<Dispatch> {
  const { data, error } = await supabase
    .from('dispatches')
    .select('id, author_id, author_name, title, body, cover_url, published_at')
    .eq('id', id)
    .single()

  if (error) throw new Error(`加载手记失败 · Load dispatch: ${error.message}`)
  return data as Dispatch
}
