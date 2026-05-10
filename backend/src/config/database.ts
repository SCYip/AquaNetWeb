import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const { Pool } = pg

const sslMode = process.env.DB_SSL === 'true'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: sslMode
    ? {
        rejectUnauthorized: true,
        cert: process.env.DB_SSL_CERT
          ? process.env.DB_SSL_CERT
          : undefined,
      }
    : undefined,
})

export const initDatabase = async () => {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255),
        auth_type VARCHAR(20) NOT NULL DEFAULT 'email',
        wechat_openid VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS buoys (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lat DECIMAL(10, 7) NOT NULL,
        lng DECIMAL(10, 7) NOT NULL,
        temp DECIMAL(5, 2) DEFAULT 0,
        ph DECIMAL(4, 2) DEFAULT 7,
        turbidity DECIMAL(8, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id VARCHAR(36) PRIMARY KEY,
        buoy_id VARCHAR(36) NOT NULL REFERENCES buoys(id) ON DELETE CASCADE,
        temp DECIMAL(5, 2),
        ph DECIMAL(4, 2),
        turbidity DECIMAL(8, 2),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS sms_codes (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_codes(phone)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sms_expires ON sms_codes(expires_at)
    `)

    console.log('Database tables initialized successfully (PostgreSQL / Supabase)')
  } finally {
    client.release()
  }
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        db: {
          schema: 'public',
        },
      })
    : null

export default pool
