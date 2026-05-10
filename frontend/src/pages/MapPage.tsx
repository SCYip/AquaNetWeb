import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import { Thermometer, Droplet, Waves as WavesIcon, Loader2, RefreshCw } from 'lucide-react'
import L from 'leaflet'
import type { Buoy } from '../services/api'
import { getAllBuoys } from '../services/buoyService'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SHENZHEN_CENTER: L.LatLngExpression = [22.5431, 114.0579]

const createBuoyIcon = (isActive: boolean) => {
  return L.divIcon({
    className: 'buoy-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${isActive ? '#32907e' : '#6b7280'};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          ${isActive ? 'animation: pulse 2s infinite;' : ''}
        "></div>
        ${isActive ? '<div style="position:absolute;width:48px;height:48px;background:#32907e;border-radius:50%;opacity:0.2;animation:ping-slow 2s infinite;"></div>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  })
}

export const MapPage = () => {
  const [buoys, setBuoys] = useState<Buoy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBuoys()
    const interval = setInterval(loadBuoys, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadBuoys = async () => {
    try {
      const data = await getAllBuoys()
      setBuoys(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load buoys:', err)
      setError('无法加载浮标数据，请检查服务器是否运行。')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-sea-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="bg-white border border-ocean-200 rounded-2xl p-8 shadow-soft max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-heading font-bold text-ocean-900 mb-2">连接错误</h3>
            <p className="text-ocean-600 mb-4 text-sm">{error}</p>
            <button
              onClick={loadBuoys}
              className="px-4 py-2 bg-sea-600 text-white rounded-xl hover:bg-sea-500 transition-colors font-medium text-sm"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-ocean-900">实时水质地图</h2>
          <p className="text-ocean-600 mt-1 text-sm">守护水环境，从"看见"开始。点击浮标查看实时数据。</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center text-sea-600">
            <span className="w-3 h-3 rounded-full bg-sea-500 mr-2" />
            活跃 ({buoys.length})
          </span>
          <span className="flex items-center text-ocean-400">
            <span className="w-3 h-3 rounded-full bg-ocean-300 mr-2" />
            离线 (0)
          </span>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={SHENZHEN_CENTER}
        zoom={11}
        className="h-[70vh] w-full rounded-2xl shadow-lifted border-4 border-white"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buoys.map((buoy) => (
          <Marker
            key={buoy.id}
            position={[buoy.lat, buoy.lng]}
            icon={createBuoyIcon(true)}
          >
            <Tooltip
              direction="top"
              offset={[0, -20]}
              opacity={1}
            >
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-ocean-100 pb-2 mb-2">
                  <h3 className="font-heading font-bold text-ocean-900">{buoy.name}</h3>
                  <span className="text-xs bg-sea-100 text-sea-700 px-2 py-0.5 rounded-full font-medium ml-2">
                    {buoy.id.slice(0, 8)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-ocean-600 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-500" />
                      水温
                    </span>
                    <span className="font-semibold text-ocean-900">{buoy.temp} °C</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-ocean-600 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-purple-500" />
                      pH值
                    </span>
                    <span className="font-semibold text-purple-600">{buoy.ph}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-ocean-600 flex items-center gap-1">
                      <WavesIcon className="w-3.5 h-3.5 text-orange-500" />
                      浊度
                    </span>
                    <span className={`font-semibold ${buoy.turbidity > 15 ? 'text-orange-600' : 'text-sea-600'}`}>
                      {buoy.turbidity} NTU
                    </span>
                  </div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-soft border border-ocean-100/60">
        <h4 className="font-heading font-semibold text-ocean-900 mb-3 text-sm">图例</h4>
        <div className="flex flex-wrap gap-6 text-sm text-ocean-700">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-sea-500" />
            <span>活跃浮标</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-ocean-400" />
            <span>离线浮标</span>
          </div>
          <div className="flex items-center gap-1 text-ocean-500 text-xs">
            <span className="text-orange-500">*</span>
            浊度 &gt;15 NTU 可能表示水质较差
          </div>
        </div>
      </div>
    </div>
  )
}
