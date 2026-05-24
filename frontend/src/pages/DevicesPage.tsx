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
 * DevicesPage — WIRED-discipline edition.
 *
 * Quiet operator strip, three big Fraunces numerals (OWNED / LIVE / DRY),
 * a clean claim flow, then the roster as hairline-divided rows. All data
 * fetching / mutation logic preserved verbatim.
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
    <div className="bg-canvas">
      {/* ════════════════════════════════════════════════════════════════
         OPERATOR STRIP
         ════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex items-baseline justify-between">
          <span className="meta">
            Operator · {user?.name ?? '—'}
          </span>
          <span className="meta tnum">{countStr}</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
         MASTHEAD + STATS
         ════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-16 md:pt-24 md:pb-20 grid grid-cols-12 gap-y-12 md:gap-x-10">
          <div className="col-span-12 md:col-span-5">
            <h1 className="font-display text-hero text-ink">
              你的浮标
            </h1>
            <p className="font-body text-lede text-ink mt-8 max-w-md">
              {count === 0
                ? '还没有认领任何一台。每一台 AquaNet 浮标底部都印着一组认领码——输进去，它就归你。'
                : '认领过的设备都列在下面。还没下水的，标好坐标再放；已经下水的，能直接看到水温、酸碱度和浊度。'}
            </p>
          </div>

          {/* Three-stat readout — big Fraunces numerals */}
          <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-x-4 md:gap-x-10 items-end">
            {[
              { label: 'OWNED', value: countStr },
              { label: 'LIVE',  value: liveStr  },
              { label: 'DRY',   value: dryStr   },
            ].map(s => (
              <div key={s.label}>
                <div
                  className="font-display text-ink leading-none tnum"
                  style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
                >
                  {s.value}
                </div>
                <div className="meta mt-4">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
         CLAIM ACTION
         ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16">
          {!showClaim ? (
            <button
              type="button"
              onClick={() => setShowClaim(true)}
              className="btn"
            >
              + 新认领
            </button>
          ) : (
            <form
              onSubmit={onClaim}
              className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8 items-end max-w-4xl"
            >
              {claimError && (
                <div
                  role="alert"
                  className="md:col-span-12 border border-link bg-link/5 text-ink p-4"
                >
                  <div className="text-body leading-snug">{claimError}</div>
                </div>
              )}

              <div className="md:col-span-5 space-y-2">
                <label htmlFor="claim-code" className="meta block">
                  设备码
                </label>
                <input
                  id="claim-code"
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  placeholder="AQN-XXXX-NNNN"
                  required
                  disabled={claiming}
                  aria-label="设备认领码"
                  className="field font-meta tnum"
                />
              </div>

              <div className="md:col-span-5 space-y-2">
                <label htmlFor="claim-name" className="meta block">
                  设备名字
                </label>
                <input
                  id="claim-name"
                  type="text"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  placeholder="例：盐田南角"
                  required
                  disabled={claiming}
                  aria-label="设备名字"
                  className="field"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <button
                  type="submit"
                  disabled={claiming}
                  className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {claiming ? '认领中…' : '认领'}
                </button>
              </div>

              <div className="md:col-span-12">
                <button
                  type="button"
                  onClick={() => {
                    setShowClaim(false)
                    setClaimError(null)
                  }}
                  className="meta hover:text-ink transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
         ROSTER
         ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          {loading ? (
            <div className="meta py-12">加载中…</div>
          ) : error ? (
            <div className="py-12 max-w-2xl">
              <h2 className="font-display text-display text-ink mb-6">
                读不到名册。
              </h2>
              <p className="meta mb-8">{error}</p>
              <button onClick={load} className="btn-outline">
                重试
              </button>
            </div>
          ) : buoys.length === 0 ? (
            <div className="py-12 max-w-2xl">
              <h2 className="font-display text-display text-ink mb-8">
                还没有认领的设备。
              </h2>
              <p className="font-body text-lede text-ink mb-10 max-w-xl">
                每一台 AquaNet 浮标都有自己的认领码——就印在底部的小字上。把它输进去，这台设备就归你管了。
              </p>
              <button
                type="button"
                onClick={() => setShowClaim(true)}
                className="btn"
              >
                认领第一台
              </button>
            </div>
          ) : (
            <div>
              {/* Column header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-ink">
                <span className="meta col-span-1">№</span>
                <span className="meta col-span-3">设备</span>
                <span className="meta col-span-2">坐标</span>
                <span className="meta col-span-1 text-right">温度</span>
                <span className="meta col-span-1 text-right">pH</span>
                <span className="meta col-span-1 text-right">浊度</span>
                <span className="meta col-span-3 text-right">操作</span>
              </div>

              <div className="divide-y divide-line">
                {buoys.map((buoy, i) => (
                  <DeviceRow
                    key={buoy.id}
                    index={i + 1}
                    buoy={buoy}
                    onDeploy={onDeploy}
                    onRelease={onRelease}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ─── DeviceRow — one buoy as a 12-col hairline row ───────────────────── */

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
    <article className="py-8">
      <div className="grid grid-cols-12 gap-x-4 gap-y-4 items-baseline">
        {/* № */}
        <span className="meta col-span-2 md:col-span-1 tnum">
          {String(index).padStart(2, '0')}
        </span>

        {/* Device — name + code */}
        <div className="col-span-10 md:col-span-3">
          <div className="font-display text-subhead text-ink leading-tight">
            {buoy.name}
          </div>
          <div className="meta mt-2 flex items-center gap-2">
            <span className="tnum">{buoy.code}</span>
            <span>·</span>
            <span>{deployed ? 'Live' : 'Undeployed'}</span>
          </div>
        </div>

        {/* Coords */}
        <div className="col-span-12 md:col-span-2">
          <span className="meta md:hidden mr-2">坐标 · </span>
          {deployed ? (
            <span className="meta tnum">
              {buoy.lat?.toFixed(4)}°N
              <br className="hidden md:block" />
              <span className="md:hidden"> · </span>
              {buoy.lng?.toFixed(4)}°E
            </span>
          ) : (
            <span className="meta">未部署</span>
          )}
        </div>

        {/* TEMP */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="meta mb-1 md:hidden">温度</div>
          <div className="font-meta tnum text-ink text-body">
            {fmtNum(buoy.temp, 1, '°C')}
          </div>
        </div>

        {/* pH */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="meta mb-1 md:hidden">pH</div>
          <div className="font-meta tnum text-ink text-body">{fmtNum(buoy.ph, 2)}</div>
        </div>

        {/* TURB */}
        <div className="col-span-4 md:col-span-1 md:text-right">
          <div className="meta mb-1 md:hidden">浊度</div>
          <div className="font-meta tnum text-ink text-body">
            {fmtNum(buoy.turbidity, 1, ' NTU')}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-3 md:text-right flex flex-wrap md:justify-end items-center gap-x-5 gap-y-2">
          {deployed ? (
            <>
              <Link
                to="/map"
                className="meta hover:text-ink transition-colors"
              >
                地图 ↗
              </Link>
              <ExportButton variant="single" buoy={buoy} size="sm" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeployForm((s) => !s)}
              className="meta hover:text-ink transition-colors"
            >
              {showDeployForm ? '取消' : '下水 ↗'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRelease(buoy.id)}
            className="meta hover:text-ink transition-colors"
            title="释放设备"
            aria-label={`释放 ${buoy.name}`}
          >
            释放
          </button>
        </div>
      </div>

      {/* Deploy form — slides in below the row when active */}
      {!deployed && showDeployForm && (
        <div className="mt-8 pt-8 border-t border-line">
          {deployErr && (
            <div
              role="alert"
              className="mb-5 border border-link bg-link/5 text-ink p-4 max-w-2xl"
            >
              <div className="text-body leading-snug">{deployErr}</div>
            </div>
          )}
          <form
            onSubmit={handleDeploy}
            className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 items-end max-w-3xl"
          >
            <div className="md:col-span-5 space-y-2">
              <label htmlFor={`lat-${buoy.id}`} className="meta block">
                纬度
              </label>
              <input
                id={`lat-${buoy.id}`}
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="22.5431"
                required
                disabled={submitting}
                aria-label="纬度"
                className="field font-meta tnum"
              />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label htmlFor={`lng-${buoy.id}`} className="meta block">
                经度
              </label>
              <input
                id={`lng-${buoy.id}`}
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="114.0579"
                required
                disabled={submitting}
                aria-label="经度"
                className="field font-meta tnum"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? '部署中…' : '部署'}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  )
}
