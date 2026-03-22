import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import { Thermometer, Droplet, Waves as WavesIcon, Loader2 } from 'lucide-react'
import L from 'leaflet'
import type { Buoy } from '../services/api'
import { getAllBuoys } from '../services/buoyService'

// Fix for default marker icons in Leaflet
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
        background: ${isActive ? '#22c55e' : '#6b7280'};
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
        ${isActive ? '<div style="position:absolute;width:48px;height:48px;background:#22c55e;border-radius:50%;opacity:0.2;animation:ping-slow 2s infinite;"></div>' : ''}
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
    
    // Poll for updates every 30 seconds
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
      setError('Failed to load buoy data. Please check if the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadBuoys}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">实时水质地图</h2>
          <p className="text-gray-600">守护水环境，从"看见"开始。点击浮标查看实时水质数据。</p>
        </div>
        <div className="flex space-x-4 text-sm font-medium">
          <span className="flex items-center text-green-600">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Active ({buoys.length})
          </span>
          <span className="flex items-center text-gray-400">
            <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
            Offline (0)
          </span>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={SHENZHEN_CENTER}
        zoom={11}
        className="h-[70vh] w-full rounded-2xl border-4 border-white shadow-xl"
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
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <h3 className="font-bold text-gray-900">{buoy.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-2">
                    {buoy.id.slice(0, 8)}
                  </span>
                </div>
                
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Thermometer className="w-3 h-3 mr-1 text-red-500" />
                      Temperature
                    </span>
                    <span className="font-semibold">{buoy.temp} °C</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Droplet className="w-3 h-3 mr-1 text-purple-500" />
                      pH Level
                    </span>
                    <span className="font-semibold text-purple-600">{buoy.ph}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <WavesIcon className="w-3 h-3 mr-1 text-orange-500" />
                      Turbidity
                    </span>
                    <span className={`font-semibold ${buoy.turbidity > 15 ? 'text-orange-600' : 'text-green-600'}`}>
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
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
            <span>Active Buoy</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
            <span>Offline Buoy</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="text-orange-500 mr-2">*</span>
            Turbidity &gt;15 NTU may indicate poor water quality
          </div>
        </div>
      </div>
    </div>
  )
}
