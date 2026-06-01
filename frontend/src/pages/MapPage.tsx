import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { BuoyRow } from '../lib/types'
import { getDeployedBuoys } from '../services/buoyService'
import { ExportButton } from '../components/ExportButton'
import '../lib/smoothWheelZoom'

/* ────────────────────────────────────────────────────────────────────────────
 * MapPage — AquaNet 水眸 · Live Map · Instrument Console
 *
 * Typographic masthead + console readouts (online / polling / last sync), a
 * full-bleed Leaflet map between hairlines, and a three-tile legend. ALL
 * Leaflet behaviour — buoy fetch, marker rendering, popup content, auto-fit
 * bounds, 30s refresh — is preserved verbatim.
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

  const Masthead = () => (
    <div className="border-b border-ink">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
        <span className="label">实时地图 · LIVE MAP</span>
        <span className="label-mute tnum flex items-center gap-2">
          <span className="signal-dot" aria-hidden="true" />
          SYNC · {lastSyncTime}
        </span>
      </div>
    </div>
  )

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div>
        <Masthead />
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-24">
          <p className="label-mute">正在接通海上节点 · CONNECTING</p>
        </section>
      </div>
    )
  }

  /* ── Error ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div>
        <Masthead />
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
          <h1 className="text-ink" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}><span className="zh">连不上水里。</span></h1>
          <div className="tile mt-6 max-w-xl">
            <div className="label mb-2" style={{ color: 'var(--signal)' }}>错误 · ERROR</div>
            <p className="article-body text-small">{error}</p>
          </div>
          <button onClick={load} className="btn mt-8">再试一次 · RETRY</button>
        </section>
      </div>
    )
  }

  /* ── Loaded ────────────────────────────────────────────────────────── */
  return (
    <div>
      <Masthead />

      {/* ── HERO + CONSOLE READOUTS ──────────────────────────────────── */}
      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1 className="text-ink max-w-4xl" style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5rem)', lineHeight: 0.98, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">水里的浮标，正在说话。</span>
        </h1>
        <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem' }}>
          <span className="zh">浮标每五分钟把读数发上来。点任意一个，看它当下的水温、酸碱度与浊度。</span>
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="tile">
            <div className="label-mute">在线浮标 · ONLINE</div>
            <div className="readout readout-lg tnum mt-3">{String(buoys.length).padStart(2, '0')}</div>
          </div>
          <div className="tile">
            <div className="label-mute">读数间隔 · READING</div>
            <div className="readout readout-lg tnum mt-3">5<span style={{ fontSize: '0.35em', marginLeft: '0.1em', color: 'var(--mute)' }}>MIN</span></div>
          </div>
          <div className="tile">
            <div className="label-mute flex items-center gap-2">最近同步 · LAST SYNC <span className="signal-dot" aria-hidden="true" /></div>
            <div className="readout readout-md tnum mt-3">{lastSyncTime}</div>
          </div>
        </div>

        <div className="mt-8">
          <ExportButton variant="fleet" />
        </div>
      </section>

      {/* ── FULL-BLEED MAP between hairlines ─────────────────────────── */}
      <section className="border-y border-ink">
        <MapContainer
          center={SHENZHEN_CENTER}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          zoomSnap={0.25}
          zoomDelta={0.5}
          className="h-[68vh] min-h-[480px] w-full"
          zoomControl
          scrollWheelZoom={false}
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
                      <span className="aq-popup__kicker">浮标 · BUOY</span>
                      <span className="aq-popup__code">
                        {b.code || b.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="aq-popup__name">{b.name}</h3>
                    <p className="aq-popup__coords">
                      {b.lat?.toFixed(4)}°N · {b.lng?.toFixed(4)}°E
                    </p>

                    <dl className="aq-popup__readings">
                      <Reading label="水温" sub="TEMP" value={fmt(b.temp, 1)} unit="°C" />
                      <Reading label="酸碱度" sub="PH" value={fmt(b.ph, 2)} />
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
                      <span className="aq-popup__updated-val">{formatRelative(b.updated_at)}</span>
                    </div>

                    <div className="aq-popup__actions">
                      <ExportButton variant="single" buoy={b} size="sm" className="w-full justify-center" />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>
      </section>

      {/* ── LEGEND: three tiles ──────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="tile">
            <div className="flex items-center gap-3">
              <span className="aq-pin" style={{ width: 22, height: 22 }}>
                <span className="aq-pin__halo" />
                <span className="aq-pin__dot" />
              </span>
              <span className="label">每一个点 · EACH DOT</span>
            </div>
            <h3 className="text-ink mt-5" style={{ fontSize: '1.375rem' }}><span className="zh">一个真实的传感器</span></h3>
            <p className="article-body text-small mt-4" style={{ color: 'var(--mute)' }}>
              <span className="zh">每个圆点是一只浮标，就在水里漂着。点击它，看到水温、酸碱度和浊度——它现在告诉我们的话。</span>
            </p>
          </div>

          <div className="tile">
            <div className="label">读数频率 · CADENCE</div>
            <h3 className="text-ink mt-5" style={{ fontSize: '1.375rem' }}><span className="zh">每 </span><span className="tnum">5</span><span className="zh"> 分钟</span></h3>
            <p className="article-body text-small mt-4" style={{ color: 'var(--mute)' }}>
              <span className="zh">浮标每五分钟把一组新读数发上来。上方的下载按钮可以把所有浮标当下的状态打包成 CSV。</span>
            </p>
          </div>

          <div className="tile">
            <div className="label" style={{ color: 'var(--signal)' }}>阈值 · THRESHOLD</div>
            <h3 className="text-ink mt-5" style={{ fontSize: '1.375rem' }}><span className="zh">浊度 </span>&gt; <span className="tnum">15</span> NTU</h3>
            <p className="article-body text-small mt-4" style={{ color: 'var(--mute)' }}>
              <span className="zh">超过阈值的读数会被特别标出，提醒你这一处值得多看一眼。其他指标暂以原始数值呈现。</span>
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <span className="label-mute tnum">LAST REFRESH · {lastSyncTime}</span>
          <button type="button" onClick={load} className="btn-outline" aria-label="刷新地图数据">刷新 · REFRESH</button>
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
