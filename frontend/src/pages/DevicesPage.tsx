import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Radio,
  MapPin,
  Trash2,
  Plus,
  Check,
  Thermometer,
  Droplet,
  Waves as WavesIcon,
} from 'lucide-react'
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
 * DevicesPage — 我的设备 · MY DEVICES
 *
 * Two-step ownership flow: claim a buoy by its physical code, then deploy
 * it by setting coordinates. Field Bulletin treatment.
 *
 * RLS handles permissions:
 *   - claim: UPDATE allowed only when owner_id IS NULL
 *   - deploy / release: UPDATE allowed only when owner_id = auth.uid()
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

  return (
    <div className="bg-sand-50 text-ocean-950 min-h-[80vh]">
      {/* ─── 00 · MASTHEAD ─────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-14 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">FROM YOUR DESK · 你的工作台</span>
            <span className="text-sea-700">我的设备 · MY DEVICES</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">
                {user ? `BY ${user.name.toUpperCase()}` : 'YOUR DESK'} · 工作台
              </p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2rem,5.5vw,4.5rem)]">
                这些<span className="display-italic text-sea-700">是你</span>，<br />
                负责的<span className="display-italic text-sand-700">那几台</span>。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                CLAIM · DEPLOY · RELEASE
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
                <Stat label="OWNED · 认领" value={String(buoys.length).padStart(2, '0')} />
                <Stat label="LIVE · 在水里" value={String(deployed.length).padStart(2, '0')} />
              </div>
              <button
                onClick={() => setShowClaim((s) => !s)}
                className="mono-label inline-flex items-center justify-center gap-2 border border-ocean-900 px-5 py-3 hover:bg-ocean-950 hover:text-sand-50 transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                {showClaim ? 'CLOSE · 收起' : 'CLAIM A DEVICE · 认领一台'}
              </button>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── §01 · CLAIM FORM (collapsible) ────────────────────────────── */}
      {showClaim && (
        <section className="bg-ocean-950 text-sand-50 reveal">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 md:py-20">
            <p className="section-eyebrow text-sea-300 mb-5">01 · 认领 · CLAIM</p>
            <h2 className="font-heading font-semibold leading-[0.98] text-[clamp(1.8rem,4vw,3rem)] mb-10">
              拿出你的<span className="display-italic text-sea-200">认领码</span>。
            </h2>

            {claimError && (
              <div className="border border-[#f08c6e] bg-[#3b1610] text-[#fbe9e1] p-4 flex gap-3 items-start mb-6">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                <div className="font-body text-sm leading-snug">{claimError}</div>
              </div>
            )}

            <form onSubmit={onClaim} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5">
                <label className="block mono-label text-sea-200 mb-2">
                  设备码 · DEVICE CODE
                </label>
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  placeholder="AQN-XXXX-NNNN"
                  required
                  disabled={claiming}
                  className="aq-input-dark"
                />
                <p className="mono-label-sm text-sea-300/70 mt-2">
                  贴在设备底部的小字 · printed on the underside
                </p>
              </div>

              <div className="md:col-span-5">
                <label className="block mono-label text-sea-200 mb-2">
                  设备名字 · NAME
                </label>
                <input
                  type="text"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  placeholder="例：盐田南角"
                  required
                  disabled={claiming}
                  className="aq-input-dark"
                />
                <p className="mono-label-sm text-sea-300/70 mt-2">
                  你之后会反复看到的名字 · what you&apos;ll see in the list
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={claiming}
                  className="w-full bg-sea-400 text-ocean-950 mono-label py-3 hover:bg-sea-300 disabled:bg-ocean-700 disabled:cursor-wait transition-colors flex items-center justify-center gap-2"
                >
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                  CLAIM
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ─── §02 · DEVICE LIST ────────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-10 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              {showClaim ? '02' : '01'} · 名册 · ROSTER
            </h2>
            <span className="mono-label text-ocean-500">
              {loading ? 'LOADING · 加载中' : `${buoys.length} ENTRIES · 共 ${buoys.length} 台`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-ocean-500" />
            </div>
          ) : error ? (
            <div className="border border-ocean-300 bg-white/60 backdrop-blur-sm p-10 text-center">
              <AlertCircle className="w-7 h-7 text-[#a24b29] mx-auto mb-3" strokeWidth={1.5} />
              <p className="display-italic text-2xl text-ocean-950 mb-2">读不到名册。</p>
              <p className="mono-label text-ocean-600">{error}</p>
            </div>
          ) : buoys.length === 0 ? (
            <div className="py-20 text-center">
              <p className="display-italic text-3xl text-ocean-900 mb-4">
                还没有<span className="text-sea-700">认领的设备</span>。
              </p>
              <p className="font-body text-ocean-600 mb-8 max-w-md mx-auto leading-[1.7]">
                每一台 AquaNet 浮标都有自己的认领码——在底部的小字上。把它输进去，这台设备就归你管了。
              </p>
              <button
                onClick={() => setShowClaim(true)}
                className="mono-label inline-flex items-center gap-2 border border-ocean-900 px-5 py-3 hover:bg-ocean-950 hover:text-sand-50 transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                CLAIM YOUR FIRST · 认领第一台
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {buoys.map((buoy) => (
                <DeviceRow
                  key={buoy.id}
                  buoy={buoy}
                  onDeploy={onDeploy}
                  onRelease={onRelease}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ─── Stat block (masthead aside) ─────────────────────────────────────── */

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="mono-label text-ocean-500 mb-2">{label}</div>
    <div className="font-heading text-4xl text-ocean-950 tabular-nums">{value}</div>
  </div>
)

/* ─── DeviceRow — one buoy card ───────────────────────────────────────── */

interface DeviceRowProps {
  buoy: BuoyRow
  onDeploy: (id: string, lat: number, lng: number) => Promise<void>
  onRelease: (id: string) => Promise<void>
}

const DeviceRow = ({ buoy, onDeploy, onRelease }: DeviceRowProps) => {
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
    <article className="border-[1.5px] border-ocean-900/80 bg-white/70 backdrop-blur-sm">
      <header className="border-b border-ocean-200 px-6 py-4 flex flex-wrap items-baseline justify-between gap-y-2">
        <div className="flex items-baseline gap-3 mono-label">
          <span className="text-sea-700 inline-flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" strokeWidth={2} />
            DEVICE
          </span>
          <span className="text-ocean-300" aria-hidden>·</span>
          <span className="text-ocean-500 tabular-nums">{buoy.code}</span>
        </div>
        <div className="mono-label-sm">
          {deployed ? (
            <span className="text-sea-700 inline-flex items-center gap-1.5">
              <span className="live-dot" /> LIVE · 在水里
            </span>
          ) : (
            <span className="text-[#a24b29]">UNDEPLOYED · 待部署</span>
          )}
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
        <div className="md:col-span-5">
          <h3 className="font-heading text-3xl text-ocean-950 leading-[1.1] mb-2">{buoy.name}</h3>
          {deployed ? (
            <p className="mono-label-sm text-ocean-500 tabular-nums inline-flex items-center gap-2">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              {buoy.lat?.toFixed(4)}°N · {buoy.lng?.toFixed(4)}°E
            </p>
          ) : (
            <p className="font-body text-ocean-600 leading-[1.7] text-sm">
              已认领但还没下水。<span className="display-italic text-sea-700">想清楚了再放</span>。
            </p>
          )}
        </div>

        {deployed ? (
          <div className="md:col-span-7 grid grid-cols-3 gap-x-4 md:gap-x-8">
            <Mini icon={<Thermometer className="w-3.5 h-3.5" />} label="水温" value={fmtNum(buoy.temp, 1, '°C')} />
            <Mini icon={<Droplet className="w-3.5 h-3.5" />} label="pH" value={fmtNum(buoy.ph, 2)} />
            <Mini icon={<WavesIcon className="w-3.5 h-3.5" />} label="浊度" value={fmtNum(buoy.turbidity, 1, ' NTU')} warn={buoy.turbidity !== null && Number(buoy.turbidity) > 15} />
          </div>
        ) : null}
      </div>

      {!deployed && showDeployForm && (
        <div className="border-t border-ocean-200 bg-ocean-50/60 px-6 py-6">
          {deployErr && (
            <div className="border border-[#a24b29] bg-[#fbe9e1] text-[#7a3119] p-3 mb-4 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
              {deployErr}
            </div>
          )}
          <form onSubmit={handleDeploy} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block mono-label text-ocean-700 mb-2">纬度 · LAT</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="22.5431"
                required
                disabled={submitting}
                className="aq-input"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block mono-label text-ocean-700 mb-2">经度 · LNG</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="114.0579"
                required
                disabled={submitting}
                className="aq-input"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ocean-950 text-sand-50 mono-label py-3 hover:bg-sea-700 transition-colors disabled:bg-ocean-700 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                DEPLOY
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="border-t border-ocean-200 px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-3 justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {deployed ? (
            <>
              <Link
                to="/map"
                className="mono-label-sm border-b border-ocean-400 pb-px text-ocean-700 hover:text-ocean-950 hover:border-ocean-900 inline-flex items-center gap-1 transition-colors"
              >
                VIEW ON MAP · 看地图
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <ExportButton variant="single" buoy={buoy} size="sm" />
            </>
          ) : (
            <button
              onClick={() => setShowDeployForm((s) => !s)}
              className="mono-label-sm border-b border-sea-700 pb-px text-sea-700 hover:text-ocean-950 hover:border-ocean-900 inline-flex items-center gap-1 transition-colors"
            >
              {showDeployForm ? 'CANCEL · 取消' : 'DEPLOY · 部署到水里'}
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => onRelease(buoy.id)}
          className="mono-label-sm text-ocean-400 hover:text-[#a24b29] inline-flex items-center gap-1.5 transition-colors"
          title="释放设备"
        >
          <Trash2 className="w-3 h-3" strokeWidth={2} />
          RELEASE · 释放
        </button>
      </footer>
    </article>
  )
}

/* ─── Compact telemetry mini ──────────────────────────────────────────── */

interface MiniProps {
  icon: React.ReactNode
  label: string
  value: string
  warn?: boolean
}

const Mini = ({ icon, label, value, warn }: MiniProps) => (
  <div>
    <div className={`mono-label-sm inline-flex items-center gap-1.5 mb-1 ${warn ? 'text-[#a24b29]' : 'text-ocean-600'}`}>
      {icon}
      {label}
    </div>
    <div className={`font-heading text-2xl tabular-nums ${warn ? 'text-[#a24b29]' : 'text-ocean-950'}`}>
      {value}
    </div>
  </div>
)
