import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { BuoyRow } from '../lib/types'
import { getDeployedBuoys } from '../services/buoyService'
import { ExportButton } from '../components/ExportButton'

/* ────────────────────────────────────────────────────────────────────────────
 * MapPage — AquaNet 水眸 · Live Map
 *
 * WIRED-discipline edition. A full-bleed ocean photo opens the page, three
 * clean stats announce the fleet on canvas, a full-bleed Leaflet map sits
 * between hairlines, and a simple three-cell legend explains how to read the
 * marks. All Leaflet behaviour — buoy fetch, marker rendering, popup content,
 * auto-fit bounds, 30s refresh — is preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const HERO_IMG = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2400&q=80&auto=format&fit=crop'

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
  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
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

  const lastSyncTime = lastSync
    ? lastSync.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--'

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div>
        <figure className="relative">
          <img src={HERO_IMG} alt="" className="w-full h-[55vh] object-cover" loading="eager" />
        </figure>
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
          <p className="meta">正在接通海上节点。</p>
        </section>
      </div>
    )
  }

  /* ── Error ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div>
        <figure className="relative">
          <img src={HERO_IMG} alt="" className="w-full h-[55vh] object-cover" loading="eager" />
        </figure>
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
          <h1 className="font-display text-display text-ink">连不上水里。</h1>
          <p className="font-body text-body text-mute mt-6 max-w-xl">{error}</p>
          <button onClick={load} className="btn mt-8">再试一次</button>
        </section>
      </div>
    )
  }

  /* ── Loaded ────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* ── HERO: full-bleed photo, no veil ──────────────────────────── */}
      <figure className="relative">
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[55vh] object-cover"
          loading="eager"
        />
      </figure>

      {/* ── HEADLINE + STATS ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-16 md:pb-20">
        <h1 className="font-display text-hero text-ink max-w-4xl">
          今天，水里的浮标正在说话。
        </h1>
        <p className="font-body text-lede text-ink mt-8 max-w-2xl">
          一队浮标，每三十秒同步一次。点任意一个，看它当下的水温、酸碱度与浊度。
        </p>

        <div className="mt-14 pt-10 border-t border-line grid grid-cols-1 md:grid-cols-3 md:divide-x divide-line">
          <div className="md:pr-10">
            <div className="meta">Online</div>
            <div className="font-display text-ink leading-none tnum mt-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              {String(buoys.length).padStart(2, '0')}
            </div>
            <div className="font-body text-body text-mute mt-4">在线浮标</div>
          </div>
          <div className="mt-10 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-line md:px-10">
            <div className="meta">Polling</div>
            <div className="font-display text-ink leading-none tnum mt-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              30<span className="font-body text-lede text-mute ml-2">s</span>
            </div>
            <div className="font-body text-body text-mute mt-4">每三十秒拉一次</div>
          </div>
          <div className="mt-10 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-line md:pl-10">
            <div className="meta flex items-center gap-2">
              Last sync
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full bg-link"
                title="live"
              />
            </div>
            <div className="font-display text-ink leading-none tnum mt-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              {lastSyncTime}
            </div>
            <div className="font-body text-body text-mute mt-4">最近一次同步</div>
          </div>
        </div>

        <div className="mt-10">
          <ExportButton variant="fleet" />
        </div>
      </section>

      {/* ── FULL-BLEED MAP between hairlines ─────────────────────────── */}
      <section className="border-y border-line">
        <MapContainer
          center={SHENZHEN_CENTER}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          zoomSnap={0.25}
          zoomDelta={0.5}
          className="h-[68vh] min-h-[480px] w-full"
          zoomControl
          scrollWheelZoom
          wheelDebounceTime={20}
          wheelPxPerZoomLevel={80}
          dragging
          inertia
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
                <Popup className="aq-popup" maxWidth={360} minWidth={320}>
                  <div className="aq-popup-inner">
                    <div className="aq-popup__head">
                      <span className="aq-popup__kicker">浮标</span>
                      <span className="aq-popup__code">
                        {b.code || b.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="aq-popup__name">{b.name}</h3>
                    <p className="aq-popup__coords">
                      {b.lat?.toFixed(4)}°N · {b.lng?.toFixed(4)}°E
                    </p>

                    <dl className="aq-popup__readings">
                      <Reading
                        label="水温"
                        sub="TEMP"
                        value={fmt(b.temp, 1)}
                        unit="°C"
                      />
                      <Reading
                        label="酸碱度"
                        sub="PH"
                        value={fmt(b.ph, 2)}
                      />
                      <Reading
                        label="浊度"
                        sub="TURB"
                        value={fmt(b.turbidity, 1)}
                        unit="NTU"
                        warn={b.turbidity !== null && Number(b.turbidity) > 15}
                      />
                    </dl>

                    <div className="aq-popup__updated">
                      <span>上次更新</span>
                      <span className="aq-popup__updated-val">
                        {formatRelative(b.updated_at)}
                      </span>
                    </div>

                    <div className="aq-popup__actions">
                      <ExportButton
                        variant="single"
                        buoy={b}
                        size="sm"
                        className="w-full justify-center"
                      />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>
      </section>

      {/* ── LEGEND: three-cell explainer on canvas ───────────────────── */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-24 grid grid-cols-1 md:grid-cols-3 md:divide-x divide-line">
          <div className="md:pr-10">
            <div className="flex items-center gap-3">
              <span className="aq-pin" style={{ width: 22, height: 22 }}>
                <span className="aq-pin__halo" />
                <span className="aq-pin__dot" />
              </span>
              <div className="meta">每一个点</div>
            </div>
            <h3 className="font-display text-subhead text-ink mt-5">一个真实的传感器</h3>
            <p className="font-body text-body text-mute mt-4">
              每个圆点是一只浮标，就在水里漂着。点击它，看到水温、酸碱度和浊度——它现在告诉我们的话。
            </p>
          </div>

          <div className="mt-10 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-line md:px-10">
            <div className="meta">同步频率</div>
            <h3 className="font-display text-subhead text-ink mt-5">
              每 <span className="tnum">30</span> 秒
            </h3>
            <p className="font-body text-body text-mute mt-4">
              数据每三十秒自动同步一次。右上角的下载按钮可以把整队浮标当下的状态打包成 CSV。
            </p>
          </div>

          <div className="mt-10 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-line md:pl-10">
            <div className="meta">阈值</div>
            <h3 className="font-display text-subhead text-ink mt-5">
              浊度 &gt; <span className="tnum">15</span> NTU
            </h3>
            <p className="font-body text-body text-mute mt-4">
              超过阈值的读数会被特别标出，提醒你这一处值得多看一眼。其他指标暂以原始数值呈现。
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <span className="meta tnum">Last refresh · {lastSyncTime}</span>
          <button type="button" onClick={load} className="btn-outline" aria-label="刷新地图数据">
            刷新
          </button>
        </div>
      </section>
    </div>
  )
}

/* ── Telemetry row ───────────────────────────────────────────────────── */

interface ReadingProps {
  label: string
  sub: string
  value: string
  unit?: string
  warn?: boolean
}

const Reading = ({ label, sub, value, unit, warn }: ReadingProps) => (
  <div className={`aq-reading ${warn ? 'aq-reading--warn' : ''}`}>
    <span className="aq-reading__label">
      <span className="aq-reading__zh">{label}</span>
      <span className="aq-reading__en">{sub}</span>
    </span>
    <span className="aq-reading__value">
      {value}
      {unit && <span className="aq-reading__unit">{unit}</span>}
    </span>
  </div>
)
