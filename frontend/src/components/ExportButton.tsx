import { useState } from 'react'
import { Download, Check, Loader2 } from 'lucide-react'
import type { BuoyRow } from '../lib/types'
import { downloadFleetSnapshot, downloadSingleBuoyCsv } from '../services/exportService'

/**
 * ExportButton — CSV download trigger.
 *
 * Two variants:
 *   - "fleet"  · downloads every deployed buoy in one CSV
 *   - "single" · downloads only the buoy passed in `buoy` prop
 */

type Variant =
  | { variant: 'fleet'; buoy?: never }
  | { variant: 'single'; buoy: BuoyRow }

type Props = Variant & {
  size?: 'sm' | 'md'
  className?: string
}

export const ExportButton = (props: Props) => {
  const { size = 'md', className = '' } = props
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [err, setErr] = useState<string | null>(null)

  const trigger = async () => {
    setErr(null)
    setState('loading')
    try {
      if (props.variant === 'fleet') {
        await downloadFleetSnapshot()
      } else {
        downloadSingleBuoyCsv(props.buoy)
      }
      setState('success')
      setTimeout(() => setState('idle'), 1800)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '下载失败')
      setState('idle')
    }
  }

  const padding = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2.5'
  const text = size === 'sm' ? 'text-[0.68rem]' : 'text-xs'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  const label =
    state === 'loading'
      ? props.variant === 'fleet'
        ? 'PREPARING · 准备下载'
        : 'EXPORTING · 导出中'
      : state === 'success'
      ? 'DOWNLOADED · 已下载'
      : props.variant === 'fleet'
      ? 'DOWNLOAD FLEET · 下载全部'
      : 'EXPORT CSV · 下载'

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={state === 'loading'}
      className={[
        'inline-flex items-center gap-2 border border-ocean-900/80 bg-sand-50 text-ocean-950',
        'tracking-[0.18em] font-mono uppercase font-semibold',
        'transition-all duration-200 hover:bg-ocean-950 hover:text-sand-50',
        'disabled:cursor-wait disabled:opacity-70',
        padding,
        text,
        className,
      ].join(' ')}
      title={err ?? undefined}
    >
      {state === 'loading' ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : state === 'success' ? (
        <Check className={iconSize} strokeWidth={2.5} />
      ) : (
        <Download className={iconSize} strokeWidth={2} />
      )}
      <span>{label}</span>
    </button>
  )
}
