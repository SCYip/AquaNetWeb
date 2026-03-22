import { api, type Buoy, type CreateBuoyData } from './api'

// Get all buoys (public)
export const getAllBuoys = async (): Promise<Buoy[]> => {
  return await api.getBuoys()
}

// Get buoy by ID
export const getBuoyById = async (id: string): Promise<Buoy> => {
  return await api.getBuoyById(id)
}

// Get user's buoys (authenticated)
export const getBuoysByOwner = async (ownerId: string): Promise<Buoy[]> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  const buoys = await api.getMyBuoys(token)
  return buoys.filter(b => b.owner_id === ownerId)
}

// Create new buoy
export const createBuoy = async (data: CreateBuoyData): Promise<string> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  const buoy = await api.createBuoy(token, data)
  return buoy.id
}

// Update buoy
export const updateBuoy = async (id: string, data: Partial<Buoy>): Promise<Buoy> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  return await api.updateBuoy(token, id, data)
}

// Delete buoy
export const deleteBuoy = async (id: string): Promise<void> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  await api.deleteBuoy(token, id)
}

// Update telemetry data (for buoy devices to send data)
export const updateTelemetry = async (
  buoyId: string,
  data: { temp?: number; ph?: number; turbidity?: number }
): Promise<Buoy> => {
  const token = localStorage.getItem('aquanet_token')
  if (!token) throw new Error('Not authenticated')
  return await api.updateTelemetry(token, buoyId, data)
}
