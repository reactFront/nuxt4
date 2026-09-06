import { pool } from '../../../src/config/database'
import { verfiyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  // 1. Get JWT from HTTP-only cookie
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  try {
    // 2. Verify JWT
    const decoded = verfiyToken(token) as {
      userId: number
    }

    // 3. Get user from PostgreSQL
    const result = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    )

    // 4. User doesn't exist
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // 5. Return logged-in user
    return {
      success: true,
      user: result.rows[0]
    }

  } catch (error) {
    // JWT invalid or expired
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
})