import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import {
  Loader2,
  RefreshCw,
  Thermometer,
  Droplet,
  Waves as WavesIcon,
  Radio,
  ArrowUpRight,
} from 'lucide-react'
import L from 'leaflet'
import type { BuoyRow } from '../lib/types'
import { getDeployedBuoys } from '../services/buoyService'
import { ExportButton } from '../components/ExportButton'

/* ────────────────────────────────────────────────────────────────────────────
 * MapPage — 实时地图 · LIVE FIELD MAP
 *
 * Field Bulletin treatment for the live buoy map. The map auto-fits to all
 * deployed buoys on load; each marker carries a permanent tooltip with its
 * name so the fleet is readable at a glance. Click a marker for a stationery
 * popup with full telemetry.
 *
 * Wheel zoom is intentionally disabled — page scroll is the priority on a
 * long-form layout. Use the +/- buttons (or pinch on touch) to zoom.
 *
 * Telemetry fields are nullable in the schema, so any missing reading is
 * rendered as an em-dash rather than "0".
 * ──────────────────────────────────────────────────────────────────────────── */

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SHENZHEN_CENTER: L.LatLngExpression = [22.5431, 114.0579]

const buoyIcon = L.divIcon({
  className: 'buoy-marker',
  html: `
    <span class="aq-pin">
      <span class="aq-pin__halo"></span>
      <span class="aq-pin__dot"></span>
    </span>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -18],
  tooltipAnchor: [0, -14],
})

/* Auto-fit the viewport to every deployed buoy when the list changes. */
const FitBoundsToBuoys = ({ buoys }: { buoys: BuoyRow[] }) => {
  const map = useMap()
  useEffect(() => {
    const points = buoys
      .filter((b): b is BuoyRow & { lat: number; lng: number } => b.lat !== null && b.lng !== null)
      .map((b) => [b.lat, b.lng] as [number, number])
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 13, { animate: false })
      return
    }
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: false })
  }, [buoys, map])
  return null
}

function fmt(v: number | null | undefined, digits = 1, suffix = ''): string {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  const n = Number(v)
  return `${n.toFixed(digits)}${suffix}`
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const seconds = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (seconds < 60) return `${seconds}s ago · 刚刚`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago · ${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago · ${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days}d ago · ${days} 天前`
}

export const MapPage = () => {
  const [buoys, setBuoys] = useState<BuoyRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    void load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const load = async () => {
    try {
      const data = await getDeployedBuoys()
      setBuoys(data)
      setLastSync(new Date())
      setError(null)
    } catch (err) {
      console.error('Failed to load buoys:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="bg-sand-50 bg-grain min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-7 h-7 animate-spin text-ocean-700" strokeWidth={1.6} />
          <p className="mono-label text-ocean-600">CONNECTING · 正在接通海上节点</p>
        </div>
      </div>
    )
  }

  /* ── Error ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="bg-sand-50 bg-grain min-h-[80vh] flex items-center justify-center px-6">
        <div className="border border-ocean-300 bg-white/70 backdrop-blur-sm p-10 max-w-md text-center">
          <RefreshCw className="w-7 h-7 text-[#a24b29] mx-auto mb-4" strokeWidth={1.4} />
          <p className="display-italic text-3xl text-ocean-950 mb-3">连不上水里。</p>
          <p className="mono-label text-ocean-600 mb-6 leading-[1.7]">{error}</p>
          <button
            onClick={load}
            className="border border-ocean-900 px-5 py-2 mono-label text-ocean-950 hover:bg-ocean-950 hover:text-sand-50 transition-colors"
          >
            RETRY · 重试
          </button>
        </div>
      </div>
    )
  }

  /* ── Loaded ────────────────────────────────────────────────────────── */
  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ─────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-14 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">FIELD MAP · 实时地图</span>
            <span className="text-sea-700 inline-flex items-center gap-2">
              <span className="live-dot" /> LIVE · {lastSync ? lastSync.toLocaleTimeString('en-GB') : '—'}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">实时 · LIVE READINGS</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,5rem)]">
                <span className="display-italic text-sea-700">现在</span>，<br />
                水里<span className="display-italic text-sand-700">在发生</span>什么。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                <span>POLLING EVERY 30 s · 每三十秒同步</span>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
                <div>
                  <div className="mono-label text-ocean-500 mb-2">DEPLOYED</div>
                  <div className="font-heading text-4xl text-ocean-950 tabular-nums">
                    {String(buoys.length).padStart(2, '0')}
                  </div>
                  <div className="mono-label-sm text-ocean-600 mt-1">浮标在线</div>
                </div>
                <div>
                  <div className="mono-label text-ocean-500 mb-2">LAST SYNC</div>
                  <div className="font-heading text-2xl text-ocean-950">
                    {lastSync ? lastSync.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                  <div className="mono-label-sm text-ocean-600 mt-1">本次刷新</div>
                </div>
              </div>
              <ExportButton variant="fleet" />
            </aside>
          </div>
        </div>
      </header>

      {/* ─── §01 · MAP ──────────────────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 md:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-8 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">01 · 现场 · ON THE WATER</h2>
            <span className="mono-label text-ocean-500">
              CLICK A BUOY · 点击浮标查看
            </span>
          </div>

          <div className="relative border-[1.5px] border-ocean-900/80 shadow-[0_28px_60px_-32px_rgba(8,32,52,0.5)]">
            <span aria-hidden className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-ocean-900 z-[401]" />
            <span aria-hidden className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-ocean-900 z-[401]" />
            <span aria-hidden className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-ocean-900 z-[401]" />
            <span aria-hidden className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-ocean-900 z-[401]" />

            <MapContainer
              center={SHENZHEN_CENTER}
              zoom={11}
              minZoom={8}
              maxZoom={18}
              className="h-[68vh] min-h-[480px] w-full"
              zoomControl
              scrollWheelZoom={false}
              dragging
              doubleClickZoom
              touchZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              <FitBoundsToBuoys buoys={buoys} />

              {buoys.map((b) =>
                b.lat !== null && b.lng !== null ? (
                  <Marker key={b.id} position={[b.lat, b.lng]} icon={buoyIcon}>
                    <Tooltip
                      direction="top"
                      offset={[0, -16]}
                      opacity={1}
                      permanent
                      className="aq-tooltip"
                    >
                      <span className="aq-tooltip__name">{b.name}</span>
                      <span className="aq-tooltip__code">{b.code || b.id.slice(0, 8)}</span>
                    </Tooltip>
                    <Popup className="aq-popup" maxWidth={320} minWidth={280}>
                      <div className="aq-popup-inner">
                        <div className="flex items-baseline justify-between border-b border-ocean-200 pb-2 mb-3">
                          <span className="mono-label text-sea-700 inline-flex items-center gap-1.5">
                            <Radio className="w-3 h-3" strokeWidth={2.2} />
                            BUOY · 浮标
                          </span>
                          <span className="mono-label-sm text-ocean-500 tabular-nums">
                            {b.code || b.id.slice(0, 8)}
                          </span>
                        </div>

                        <h3 className="font-heading text-2xl text-ocean-950 leading-[1.1] mb-1">
                          {b.name}
                        </h3>
                        <p className="mono-label-sm text-ocean-500 tabular-nums mb-4">
                          {b.lat?.toFixed(4)}°N · {b.lng?.toFixed(4)}°E
                        </p>

                        <dl className="space-y-2.5 mb-4">
                          <Reading
                            icon={<Thermometer className="w-3.5 h-3.5" strokeWidth={1.8} />}
                            label="水温 · TEMP"
                            value={fmt(b.temp, 1, ' °C')}
                          />
                          <Reading
                            icon={<Droplet className="w-3.5 h-3.5" strokeWidth={1.8} />}
                            label="酸碱度 · pH"
                            value={fmt(b.ph, 2)}
                          />
                          <Reading
                            icon={<WavesIcon className="w-3.5 h-3.5" strokeWidth={1.8} />}
                            label="浊度 · TURB"
                            value={fmt(b.turbidity, 1, ' NTU')}
                            warn={b.turbidity !== null && Number(b.turbidity) > 15}
                          />
                        </dl>

                        <div className="border-t border-ocean-200 pt-3 mb-3">
                          <div className="flex items-center justify-between mono-label-sm text-ocean-500">
                            <span>LAST UPDATED</span>
                            <span className="text-ocean-800">{formatRelative(b.updated_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <ExportButton variant="single" buoy={b} size="sm" />
                          <span className="mono-label-sm text-ocean-400 inline-flex items-center gap-1">
                            CSV <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null,
              )}
            </MapContainer>
          </div>

          {/* ── Legend / colophon ── */}
          <div className="mt-10 grid grid-cols-12 gap-y-8 md:gap-x-10">
            <div className="col-span-12 md:col-span-4">
              <p className="mono-label text-ocean-700 mb-3">— 图例 · LEGEND</p>
              <ul className="space-y-3 text-ocean-800">
                <li className="flex items-center gap-3">
                  <span className="aq-pin aq-pin--inline"><span className="aq-pin__halo" /><span className="aq-pin__dot" /></span>
                  <span className="text-sm">活跃浮标 · LIVE BUOY</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#a24b29]" />
                  <span className="text-sm">浊度 &gt; 15 NTU 视为异常 · ELEVATED TURBIDITY</span>
                </li>
              </ul>
            </div>

            <div className="col-span-12 md:col-span-4">
              <p className="mono-label text-ocean-700 mb-3">— 阅读 · HOW TO READ</p>
              <p className="font-body text-[0.95rem] text-ocean-700 leading-[1.7]">
                每个圆点是一个真实的传感器，<span className="display-italic text-sea-700">就在水里漂着</span>。
                点击它，看到水温、酸碱度和浊度——这是它现在告诉我们的话。
              </p>
            </div>

            <div className="col-span-12 md:col-span-4">
              <p className="mono-label text-ocean-700 mb-3">— 同步 · SYNC</p>
              <p className="font-body text-[0.95rem] text-ocean-700 leading-[1.7]">
                数据每三十秒拉一次。下载按钮把整队浮标当下的状态打包成 CSV，
                <span className="display-italic text-sand-700">带着走</span>。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Telemetry row ───────────────────────────────────────────────────── */

interface ReadingProps {
  icon: React.ReactNode
  label: string
  value: string
  warn?: boolean
}

const Reading = ({ icon, label, value, warn }: ReadingProps) => (
  <div className="flex items-baseline justify-between border-b border-dotted border-ocean-200 pb-2 last:border-0 last:pb-0">
    <dt className="mono-label-sm text-ocean-600 inline-flex items-center gap-1.5">
      <span className={warn ? 'text-[#a24b29]' : 'text-ocean-700'}>{icon}</span>
      {label}
    </dt>
    <dd className={`font-heading tabular-nums text-base ${warn ? 'text-[#a24b29]' : 'text-ocean-950'}`}>
      {value}
    </dd>
  </div>
)
