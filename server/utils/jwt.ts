import jwt from 'jsonwebtoken';
const config = useRuntimeConfig();

export function generateToken(userId: number) {
    return jwt.sign(
        {
            userId
        },
        config.jwtSecret,
        {
            expiresIn: '7d'
        }

    ) 
}

export function verfiyToken(token: string) {
    return jwt.verify (
        token,
        config.jwtSecret
    )
}