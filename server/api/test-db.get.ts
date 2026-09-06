import { defineEventHandler } from 'h3'
import { pool } from '../../src/config/database'

export default defineEventHandler(async () => {
    try {
      const result = await pool.query('SELECT NOW() AS time')
  
      return {
        success: true,
        message: 'PostgreSQL connected successfullxsdy',
        data: result.rows[0]
      }
    } catch (error) {
      console.error('Database error:', error)
  
      return {
        success: false,
        message: 'Database connection failed',
        error: String(error)
      }
    }
  })