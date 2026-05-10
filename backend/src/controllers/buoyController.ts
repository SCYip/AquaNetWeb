import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'
import type { ApiResponse, Buoy } from '../types/index.js'

export const getBuoys = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM buoys ORDER BY created_at DESC')

    res.json({
      success: true,
      data: result.rows,
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

    const result = await pool.query('SELECT * FROM buoys WHERE id = $1', [id])
    const buoys = result.rows as Buoy[]

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

    const result = await pool.query(
      'SELECT * FROM buoys WHERE owner_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      success: true,
      data: result.rows,
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

    await pool.query(
      'INSERT INTO buoys (id, name, owner_id, lat, lng, temp, ph, turbidity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name, userId, lat, lng, temp, ph, turbidity]
    )

    const result = await pool.query('SELECT * FROM buoys WHERE id = $1', [id])
    const buoys = result.rows as Buoy[]

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

    const checkResult = await pool.query(
      'SELECT owner_id FROM buoys WHERE id = $1',
      [id]
    )
    const check = checkResult.rows as { owner_id: string }[]

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

    const updates: string[] = []
    const values: (string | number)[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(name)
    }
    if (lat !== undefined) {
      updates.push(`lat = $${paramIndex++}`)
      values.push(lat)
    }
    if (lng !== undefined) {
      updates.push(`lng = $${paramIndex++}`)
      values.push(lng)
    }
    if (temp !== undefined) {
      updates.push(`temp = $${paramIndex++}`)
      values.push(temp)
    }
    if (ph !== undefined) {
      updates.push(`ph = $${paramIndex++}`)
      values.push(ph)
    }
    if (turbidity !== undefined) {
      updates.push(`turbidity = $${paramIndex++}`)
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

    await pool.query(
      `UPDATE buoys SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    const result = await pool.query('SELECT * FROM buoys WHERE id = $1', [id])
    const buoys = result.rows as Buoy[]

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

    const checkResult = await pool.query(
      'SELECT owner_id FROM buoys WHERE id = $1',
      [id]
    )
    const check = checkResult.rows as { owner_id: string }[]

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

    await pool.query('DELETE FROM buoys WHERE id = $1', [id])

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

    const buoyResult = await pool.query('SELECT * FROM buoys WHERE id = $1', [id])
    const buoys = buoyResult.rows as Buoy[]

    if (buoys.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Buoy not found',
      })
      return
    }

    const telemetryId = uuidv4()
    await pool.query(
      'INSERT INTO telemetry (id, buoy_id, temp, ph, turbidity) VALUES ($1, $2, $3, $4, $5)',
      [telemetryId, id, temp ?? buoys[0].temp, ph ?? buoys[0].ph, turbidity ?? buoys[0].turbidity]
    )

    const updates: string[] = []
    const values: (string | number)[] = []
    let paramIndex = 1

    if (temp !== undefined) {
      updates.push(`temp = $${paramIndex++}`)
      values.push(temp)
    }
    if (ph !== undefined) {
      updates.push(`ph = $${paramIndex++}`)
      values.push(ph)
    }
    if (turbidity !== undefined) {
      updates.push(`turbidity = $${paramIndex++}`)
      values.push(turbidity)
    }

    if (updates.length > 0) {
      values.push(id)
      await pool.query(
        `UPDATE buoys SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
    }

    const result = await pool.query('SELECT * FROM buoys WHERE id = $1', [id])
    const updatedBuoys = result.rows as Buoy[]

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
