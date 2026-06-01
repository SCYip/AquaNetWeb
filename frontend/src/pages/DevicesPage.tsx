import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  listMyBuoys,
  claimBuoyByCode,
  deployBuoy,
  releaseBuoy,
} from '../services/buoyService'
import type { BuoyRow } from '../lib/types'
import { ExportButton } from '../components/ExportButton'

/* ────────────────────────────────────────────────────────────────────────────
 * DevicesPage — AquaNet 水眸 · Operator Console
 *
 * The operator's terminal: an operator strip, three big readouts
 * (OWNED / LIVE / DRY), a claim panel, then the roster as an instrument
 * table. All data fetching / mutation logic preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

const isDeployed = (b: BuoyRow): b is BuoyRow & { lat: number; lng: number } =>
  b.lat !== null && b.lng !== null

const fmtNum = (v: number | null | undefined, digits = 1, suffix = ''): string => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `${Number(v).toFixed(digits)}${suffix}`
}

export const DevicesPage = () => {
  const { user } = useAuth()
  const [buoys, setBuoys] = useState<BuoyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showClaim, setShowClaim] = useState(false)
  const [claimCode, setClaimCode] = useState('')
  const [claimName, setClaimName] = useState('')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    void load()
  }, [])

  const load = async () => {
    try {
      const data = await listMyBuoys()
      setBuoys(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const onClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimError(null)
    setClaiming(true)
    try {
      const claimed = await claimBuoyByCode(claimCode, claimName)
      setBuoys((prev) => [claimed, ...prev])
      setClaimCode('')
      setClaimName('')
      setShowClaim(false)
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : '认领失败')
    } finally {
      setClaiming(false)
    }
  }

  const onDeploy = async (id: string, lat: number, lng: number) => {
    const updated = await deployBuoy(id, lat, lng)
    setBuoys((prev) => prev.map((b) => (b.id === id ? updated : b)))
  }

  const onRelease = async (id: string) => {
    if (!confirm('确认释放这台设备？认领码会回到公共池中，其他人可以重新认领。')) return
    await releaseBuoy(id)
    setBuoys((prev) => prev.filter((b) => b.id !== id))
  }

  const deployed = buoys.filter(isDeployed)
  const count = buoys.length
  const countStr = String(count).padStart(2, '0')
  const liveStr = String(deployed.length).padStart(2, '0')
  const dryStr = String(count - deployed.length).padStart(2, '0')

  return (
    <div>
      {/* ── OPERATOR STRIP ───────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">操作员 · OPERATOR · {user?.name ?? '—'}</span>
          <span className="label-mute tnum">{countStr} 台</span>
        </div>
      </div>

      {/* ── MASTHEAD + STATS ─────────────────────────────────────────── */}
      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16 grid grid-cols-12 gap-y-10 md:gap-x-10">
        <div className="col-span-12 md:col-span-5">
          <h1 className="text-ink" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.98, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
            <span className="zh">你的浮标</span>
          </h1>
          <p className="article-body mt-7 max-w-md" style={{ fontSize: '1.0625rem' }}>
            <span className="zh">
              {count === 0
                ? '还没有认领任何一台。每一台 AquaNet 浮标底部都印着一组认领码——输进去，它就归你。'
                : '认领过的设备都列在下面。还没下水的，标好坐标再放；已经下水的，能直接看到水温、酸碱度和浊度。'}
            </span>
          </p>
        </div>

        <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'OWNED · 认领', value: countStr, signal: false },
            { label: 'LIVE · 在线',  value: liveStr,  signal: true },
            { label: 'DRY · 待部署', value: dryStr,   signal: false },
          ].map((s) => (
            <div key={s.label} className="tile flex flex-col justify-between">
              <div className="label-mute flex items-center gap-1.5">
                {s.signal && Number(liveStr) > 0 && <span className="signal-dot" aria-hidden="true" />}
                {s.label}
              </div>
              <div className="readout readout-lg tnum mt-6">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLAIM ACTION ─────────────────────────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16">
          {!showClaim ? (
            <button type="button" onClick={() => setShowClaim(true)} className="btn">
              + 新认领 · CLAIM
            </button>
          ) : (
            <form onSubmit={onClaim} className="tile max-w-4xl">
              <div className="label mb-6">认领新设备 · CLAIM A BUOY</div>
              {claimError && (
                <div role="alert" className="rounded-md p-4 mb-6 border" style={{ borderColor: 'var(--signal)', background: 'rgba(255,90,31,0.06)' }}>
                  <div className="article-body text-small leading-snug">{claimError}</div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6 items-end">
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="claim-code" className="label-micro block">设备码 · CODE</label>
                  <input id="claim-code" type="text" value={claimCode} onChange={(e) => setClaimCode(e.target.value.toUpperCase())} placeholder="AQN-XXXX-NNNN" required disabled={claiming} aria-label="设备认领码" className="field-box tnum" />
                </div>
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="claim-name" className="label-micro block">设备名字 · NAME</label>
                  <input id="claim-name" type="text" value={claimName} onChange={(e) => setClaimName(e.target.value)} placeholder="例：盐田南角" required disabled={claiming} aria-label="设备名字" className="field-box" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={claiming} className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed">
                    {claiming ? '认领中…' : '认领'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowClaim(false); setClaimError(null) }}
                className="label-mute hover:text-ink transition-colors mt-5"
              >
                取消 · CANCEL
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── ROSTER ───────────────────────────────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          {loading ? (
            <div className="label-mute py-12">加载中 · LOADING</div>
          ) : error ? (
            <div className="py-12 max-w-2xl">
              <h2 className="text-ink mb-5" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">读不到名册。</span></h2>
              <div className="tile mb-8 max-w-xl">
                <div className="label mb-2" style={{ color: 'var(--signal)' }}>错误 · ERROR</div>
                <p className="article-body text-small">{error}</p>
              </div>
              <button onClick={load} className="btn-outline">重试 · RETRY</button>
            </div>
          ) : buoys.length === 0 ? (
            <div className="py-12 max-w-2xl">
              <h2 className="text-ink mb-7" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">还没有认领的设备。</span></h2>
              <p className="article-body mb-9 max-w-xl" style={{ fontSize: '1.1875rem' }}>
                <span className="zh">每一台 AquaNet 浮标都有自己的认领码——就印在底部的小字上。把它输进去，这台设备就归你管了。</span>
              </p>
              <button type="button" onClick={() => setShowClaim(true)} className="btn">认领第一台 · CLAIM</button>
            </div>
          ) : (
            <div>
              {/* Column header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-ink">
                <span className="label-micro col-span-1">№</span>
                <span className="label-micro col-span-3">设备 · UNIT</span>
                <span className="label-micro col-span-2">坐标 · COORDS</span>
                <span className="label-micro col-span-1 text-right">温度</span>
                <span className="label-micro col-span-1 text-right">pH</span>
                <span className="label-micro col-span-1 text-right">浊度</span>
                <span className="label-micro col-span-3 text-right">操作 · ACTIONS</span>
              </div>

              <div className="divide-y divide-line">
                {buoys.map((buoy, i) => (
                  <DeviceRow key={buoy.id} index={i + 1} buoy={buoy} onDeploy={onDeploy} onRelease={onRelease} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ─── DeviceRow — one buoy as a 12-col instrument row ─────────────────── */

interface DeviceRowProps {
  buoy: BuoyRow
  index: number
  onDeploy: (id: string, lat: number, lng: number) => Promise<void>
  onRelease: (id: string) => Promise<void>
}

const DeviceRow = ({ buoy, index, onDeploy, onRelease }: DeviceRowProps) => {
  const deployed = isDeployed(buoy)
  const [showDeployForm, setShowDeployForm] = useState(false)
  const [lat, setLat] = useState(buoy.lat?.toString() ?? '22.5431')
  const [lng, setLng] = useState(buoy.lng?.toString() ?? '114.0579')
  const [deployErr, setDeployErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeployErr(null)
    setSubmitting(true)
    try {
      await onDeploy(buoy.id, parseFloat(lat), parseFloat(lng))
      setShowDeployForm(false)
    } catch (err) {
      setDeployErr(err instanceof Error ? err.message : '部署失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="py-7">
      <div className="grid grid-cols-12 gap-x-4 gap-y-4 items-baseline">
        {/* № */}
        <span className="label tnum col-span-2 md:col-span-1">{String(index).padStart(2, '0')}</span>

        {/* Device — name + code + status */}
        <div className="col-span-10 md:col-span-3">
          <div className="text-ink leading-tight" style={{ fontSize: '1.25rem' }}>{buoy.name}</div>
          <div className="label-mute mt-2 flex items-center gap-2">
            <span className="tnum">{buoy.code}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: deployed ? 'var(--signal)' : 'var(--mute)' }}>
              {deployed && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--signal)' }} />}
              {deployed ? 'LIVE' : 'DRY'}
            </span>
          </div>
        </div>

        {/* Coords */}
        <div className="col-span-12 md:col-span-2">
          <span className="label-micro md:hidden mr-2">坐标 · </span>
          {deployed ? (
            <span className="readout tnum text-ink" style={{ fontSize: '0.8125rem' }}>
              {buoy.lat?.toFixed(4)}°N
              <br className="hidden md:block" />
              <span className="md:hidden"> · </span>
              {buoy.lng?.toFixed(4)}°E
            </span>
          ) : (
            <span className="label-mute">未部署</span>
          )}
        </div>

        {/* TEMP */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="label-micro mb-1 md:hidden">温度</div>
          <div className="readout tnum text-ink" style={{ fontSize: '1rem' }}>{fmtNum(buoy.temp, 1, '°C')}</div>
        </div>

        {/* pH */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="label-micro mb-1 md:hidden">pH</div>
          <div className="readout tnum text-ink" style={{ fontSize: '1rem' }}>{fmtNum(buoy.ph, 2)}</div>
        </div>

        {/* TURB */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="label-micro mb-1 md:hidden">浊度</div>
          <div className="readout tnum text-ink" style={{ fontSize: '1rem' }}>{fmtNum(buoy.turbidity, 1, ' NTU')}</div>
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-3 md:text-right flex flex-wrap md:justify-end items-center gap-x-4 gap-y-2">
          {deployed ? (
            <>
              <Link to="/map" className="label hover:text-signal transition-colors">地图 ↗</Link>
              <ExportButton variant="single" buoy={buoy} size="sm" />
            </>
          ) : (
            <button type="button" onClick={() => setShowDeployForm((s) => !s)} className="label hover:text-signal transition-colors">
              {showDeployForm ? '取消' : '下水 ↗'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRelease(buoy.id)}
            className="label-mute hover:text-signal transition-colors"
            title="释放设备"
            aria-label={`释放 ${buoy.name}`}
          >
            释放
          </button>
        </div>
      </div>

      {/* Deploy form — slides in below the row when active */}
      {!deployed && showDeployForm && (
        <div className="mt-7 pt-7 border-t border-line">
          {deployErr && (
            <div role="alert" className="mb-5 rounded-md p-4 max-w-2xl border" style={{ borderColor: 'var(--signal)', background: 'rgba(255,90,31,0.06)' }}>
              <div className="article-body text-small leading-snug">{deployErr}</div>
            </div>
          )}
          <form onSubmit={handleDeploy} className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5 items-end max-w-3xl">
            <div className="md:col-span-5 space-y-2">
              <label htmlFor={`lat-${buoy.id}`} className="label-micro block">纬度 · LAT</label>
              <input id={`lat-${buoy.id}`} type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="22.5431" required disabled={submitting} aria-label="纬度" className="field-box tnum" />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label htmlFor={`lng-${buoy.id}`} className="label-micro block">经度 · LNG</label>
              <input id={`lng-${buoy.id}`} type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="114.0579" required disabled={submitting} aria-label="经度" className="field-box tnum" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? '部署中…' : '部署'}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  )
}
