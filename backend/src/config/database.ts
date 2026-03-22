import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aquanet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const initDatabase = async () => {
  const connection = await pool.getConnection()
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255),
        auth_type ENUM('email', 'wechat', 'phone') NOT NULL DEFAULT 'email',
        wechat_openid VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create buoys table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS buoys (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id VARCHAR(36) NOT NULL,
        lat DECIMAL(10, 7) NOT NULL,
        lng DECIMAL(10, 7) NOT NULL,
        temp DECIMAL(5, 2) DEFAULT 0,
        ph DECIMAL(4, 2) DEFAULT 7,
        turbidity DECIMAL(8, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create telemetry table for historical data
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id VARCHAR(36) PRIMARY KEY,
        buoy_id VARCHAR(36) NOT NULL,
        temp DECIMAL(5, 2),
        ph DECIMAL(4, 2),
        turbidity DECIMAL(8, 2),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buoy_id) REFERENCES buoys(id) ON DELETE CASCADE
      )
    `)

    // Create SMS verification codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sms_codes (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_expires (expires_at)
      )
    `)

    console.log('Database tables initialized successfully')
  } finally {
    connection.release()
  }
}

export default pool
