import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBuoysByOwner, createBuoy, deleteBuoy } from '../services/buoyService'
import type { Buoy } from '../services/api'
import { Plus, Trash2, MapPin, Thermometer, Droplets, Eye, Loader2 } from 'lucide-react'

export const DevicesPage = () => {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const [buoys, setBuoys] = useState<Buoy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newBuoyName, setNewBuoyName] = useState('')
  const [newBuoyLat, setNewBuoyLat] = useState('')
  const [newBuoyLng, setNewBuoyLng] = useState('')

  useEffect(() => {
    if (user) {
      loadBuoys()
    }
  }, [user])

  const loadBuoys = async () => {
    if (!user) return
    try {
      const userBuoys = await getBuoysByOwner(user.id)
      setBuoys(userBuoys)
    } catch (error) {
      console.error('Error loading buoys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBuoy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await createBuoy({
        name: newBuoyName,
        lat: parseFloat(newBuoyLat),
        lng: parseFloat(newBuoyLng),
      })
      await loadBuoys()
      setShowAddForm(false)
      setNewBuoyName('')
      setNewBuoyLat('')
      setNewBuoyLng('')
    } catch (error) {
      console.error('Error creating buoy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBuoy = async (buoyId: string) => {
    if (!confirm('确定要删除此设备吗？')) return

    try {
      await deleteBuoy(buoyId)
      setBuoys(buoys.filter(b => b.id !== buoyId))
    } catch (error) {
      console.error('Error deleting buoy:', error)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sea-600" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-sea-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-sea-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-ocean-900 mb-3">请先登录</h2>
          <p className="text-ocean-600 mb-6 text-sm">登录后可管理您的水质监测设备</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-full transition-colors"
          >
            登录 / 注册
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] px-4 py-10 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ocean-900">我的设备</h1>
          <p className="text-ocean-600 mt-1 text-sm">管理您的水质监测浮标</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-full transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          添加设备
        </button>
      </div>

      {/* Add Device Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-soft border border-ocean-100/60 p-6 mb-8">
          <h3 className="font-heading font-semibold text-ocean-900 mb-4">注册新设备</h3>
          <form onSubmit={handleAddBuoy} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">设备名称</label>
              <input
                type="text"
                value={newBuoyName}
                onChange={(e) => setNewBuoyName(e.target.value)}
                className="input-field"
                placeholder="例如：海岸站 A"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">纬度</label>
              <input
                type="number"
                step="any"
                value={newBuoyLat}
                onChange={(e) => setNewBuoyLat(e.target.value)}
                className="input-field"
                placeholder="例如：22.5431"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">经度</label>
              <input
                type="number"
                step="any"
                value={newBuoyLng}
                onChange={(e) => setNewBuoyLng(e.target.value)}
                className="input-field"
                placeholder="例如：114.0579"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '添加'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-3 border border-ocean-200 rounded-xl hover:bg-ocean-50 transition-colors text-ocean-600"
                disabled={isSubmitting}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Devices Grid */}
      {buoys.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-ocean-100/60 p-12 text-center">
          <div className="w-16 h-16 bg-sea-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-sea-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-ocean-900 mb-2">还没有设备</h3>
          <p className="text-ocean-600 mb-6 text-sm">添加您的第一个水质监测浮标</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-full transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            添加第一个设备
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buoys.map((buoy) => (
            <div
              key={buoy.id}
              className="bg-white rounded-2xl shadow-soft border border-ocean-100/60 overflow-hidden hover:shadow-lifted transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-ocean-800 to-ocean-700 px-5 py-4 flex justify-between items-center">
                <h3 className="text-white font-heading font-semibold truncate">{buoy.name}</h3>
                <button
                  onClick={() => handleDeleteBuoy(buoy.id)}
                  className="p-1.5 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="删除设备"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-ocean-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{buoy.lat.toFixed(4)}, {buoy.lng.toFixed(4)}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-ocean-900">{buoy.temp}°C</div>
                    <div className="text-xs text-ocean-500">水温</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Droplets className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-ocean-900">{buoy.ph}</div>
                    <div className="text-xs text-ocean-500">pH值</div>
                  </div>
                  <div className="bg-ocean-50 rounded-xl p-3 text-center">
                    <Eye className="w-5 h-5 text-ocean-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-ocean-900">{buoy.turbidity}</div>
                    <div className="text-xs text-ocean-500">浊度</div>
                  </div>
                </div>

                <Link
                  to={`/map?buoy=${buoy.id}`}
                  className="block w-full text-center py-2.5 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-medium rounded-xl transition-colors text-sm"
                >
                  在地图上查看
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
