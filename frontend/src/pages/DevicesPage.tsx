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
  
  // New buoy form state
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
      
      // Reload buoys to get the new one with all fields
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
    if (!confirm('Are you sure you want to delete this device?')) return
    
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
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your devices</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Devices</h1>
          <p className="text-gray-600 mt-1">Manage your registered buoys and monitor water quality</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Device
        </button>
      </div>

      {/* Add Device Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Register New Device</h3>
          <form onSubmit={handleAddBuoy} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
              <input
                type="text"
                value={newBuoyName}
                onChange={(e) => setNewBuoyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., Beach Station A"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={newBuoyLat}
                onChange={(e) => setNewBuoyLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., 37.7749"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={newBuoyLng}
                onChange={(e) => setNewBuoyLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., -122.4194"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Devices Grid */}
      {buoys.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No devices yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first buoy device</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buoys.map((buoy) => (
            <div
              key={buoy.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-900 to-cyan-700 px-4 py-3 flex justify-between items-center">
                <h3 className="text-white font-semibold truncate">{buoy.name}</h3>
                <button
                  onClick={() => handleDeleteBuoy(buoy.id)}
                  className="p-1.5 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{buoy.lat.toFixed(4)}, {buoy.lng.toFixed(4)}</span>
                </div>

                {/* Current Readings */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{buoy.temp}°C</div>
                    <div className="text-xs text-gray-500">Temperature</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Droplets className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{buoy.ph}</div>
                    <div className="text-xs text-gray-500">pH Level</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{buoy.turbidity}</div>
                    <div className="text-xs text-gray-500">Turbidity</div>
                  </div>
                </div>

                {/* View on Map */}
                <Link
                  to={`/map?buoy=${buoy.id}`}
                  className="block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  View on Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
