import bcrypt from 'bcrypt'
import { pool } from '../../src/config/database'

export default defineEventHandler(async(event) => {
    const body = await readBody(event);
    const {name, email, password} = body;
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage : 'Name, email and password are required'
      })
    }

    const existingUser = await pool.query("SELECT id FROM users where email = $1",[email]);

    if (existingUser.rows.length > 0) {
       throw createError({
         statusCode: 400,
         statusMessage: 'Email already registered'
       })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("INSERT INTO users(name, email, password) VALUES ($1, $2, $3)", [name, email, hashedPassword]);

    return {
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    }
    

});

