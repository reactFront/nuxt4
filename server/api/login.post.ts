import bcrypt from 'bcrypt';
import { pool } from '../../src/config/database'
import { generateToken } from '../utils/jwt';

export default defineEventHandler(async(event) => {

    const body = await readBody(event);
    const {email, password} = body;

    if (!email || !password) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email and password are required'
        })
    }
    const result = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
    if (result.rows.length == 0) {
        return {
            statusCode: 401,
            statusMessage: 'invalid email and password'
        }
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw createError({
            statusCode: 401,
            statusMessage: "invalid email or password"
        })
    }
    const token = generateToken(user.id);
    // Store JWT in HTTP-only cookie
    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    return {
        success: true,
        message: 'Login successful',
        user: {
        id: user.id,
        name: user.name,
        email: user.email
        }
    }

})