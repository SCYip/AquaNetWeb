import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'
import type { ApiResponse, Buoy } from '../types/index.js'

export const getBuoys = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM buoys ORDER BY created_at DESC')
    
    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get buoys error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buoys',
    })
  }
}

export const getBuoyById = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute('SELECT * FROM buoys WHERE id = ?', [id])
    const buoys = rows as Buoy[]

    if (buoys.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Buoy not found',
      })
      return
    }

    res.json({
      success: true,
      data: buoys[0],
    })
  } catch (error) {
    console.error('Get buoy error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buoy',
    })
  }
}

export const getMyBuoys = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id

    const [rows] = await pool.execute(
      'SELECT * FROM buoys WHERE owner_id = ? ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get my buoys error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your buoys',
    })
  }
}

export const createBuoy = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { name, lat, lng, temp = 0, ph = 7, turbidity = 0 } = req.body

    if (!name || lat === undefined || lng === undefined) {
      res.status(400).json({
        success: false,
        error: 'Name, latitude, and longitude are required',
      })
      return
    }

    const id = uuidv4()

    await pool.execute(
      'INSERT INTO buoys (id, name, owner_id, lat, lng, temp, ph, turbidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, userId, lat, lng, temp, ph, turbidity]
    )

    const [rows] = await pool.execute('SELECT * FROM buoys WHERE id = ?', [id])
    const buoys = rows as Buoy[]

    res.status(201).json({
      success: true,
      data: buoys[0],
    })
  } catch (error) {
    console.error('Create buoy error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create buoy',
    })
  }
}

export const updateBuoy = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { id } = req.params
    const { name, lat, lng, temp, ph, turbidity } = req.body

    // Check ownership
    const [checkRows] = await pool.execute(
      'SELECT owner_id FROM buoys WHERE id = ?',
      [id]
    )
    const check = checkRows as { owner_id: string }[]

    if (check.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Buoy not found',
      })
      return
    }

    if (check[0].owner_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this buoy',
      })
      return
    }

    // Build update query
    const updates: string[] = []
    const values: (string | number)[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (lat !== undefined) {
      updates.push('lat = ?')
      values.push(lat)
    }
    if (lng !== undefined) {
      updates.push('lng = ?')
      values.push(lng)
    }
    if (temp !== undefined) {
      updates.push('temp = ?')
      values.push(temp)
    }
    if (ph !== undefined) {
      updates.push('ph = ?')
      values.push(ph)
    }
    if (turbidity !== undefined) {
      updates.push('turbidity = ?')
      values.push(turbidity)
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      })
      return
    }

    values.push(id)

    await pool.execute(
      `UPDATE buoys SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    const [rows] = await pool.execute('SELECT * FROM buoys WHERE id = ?', [id])
    const buoys = rows as Buoy[]

    res.json({
      success: true,
      data: buoys[0],
    })
  } catch (error) {
    console.error('Update buoy error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update buoy',
    })
  }
}

export const deleteBuoy = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { id } = req.params

    // Check ownership
    const [checkRows] = await pool.execute(
      'SELECT owner_id FROM buoys WHERE id = ?',
      [id]
    )
    const check = checkRows as { owner_id: string }[]

    if (check.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Buoy not found',
      })
      return
    }

    if (check[0].owner_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this buoy',
      })
      return
    }

    await pool.execute('DELETE FROM buoys WHERE id = ?', [id])

    res.json({
      success: true,
      message: 'Buoy deleted successfully',
    })
  } catch (error) {
    console.error('Delete buoy error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete buoy',
    })
  }
}

export const updateBuoyTelemetry = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params
    const { temp, ph, turbidity } = req.body

    // Get buoy
    const [buoyRows] = await pool.execute('SELECT * FROM buoys WHERE id = ?', [id])
    const buoys = buoyRows as Buoy[]

    if (buoys.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Buoy not found',
      })
      return
    }

    // Store telemetry
    const telemetryId = uuidv4()
    await pool.execute(
      'INSERT INTO telemetry (id, buoy_id, temp, ph, turbidity) VALUES (?, ?, ?, ?, ?)',
      [telemetryId, id, temp ?? buoys[0].temp, ph ?? buoys[0].ph, turbidity ?? buoys[0].turbidity]
    )

    // Update buoy current values
    const updates: string[] = []
    const values: (string | number)[] = []

    if (temp !== undefined) {
      updates.push('temp = ?')
      values.push(temp)
    }
    if (ph !== undefined) {
      updates.push('ph = ?')
      values.push(ph)
    }
    if (turbidity !== undefined) {
      updates.push('turbidity = ?')
      values.push(turbidity)
    }

    if (updates.length > 0) {
      values.push(id)
      await pool.execute(
        `UPDATE buoys SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }

    // Return updated buoy
    const [rows] = await pool.execute('SELECT * FROM buoys WHERE id = ?', [id])
    const updatedBuoys = rows as Buoy[]

    res.json({
      success: true,
      data: updatedBuoys[0],
    })
  } catch (error) {
    console.error('Update telemetry error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update telemetry',
    })
  }
}
