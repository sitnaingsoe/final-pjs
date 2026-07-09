import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret'

const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '15m'
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d'

export interface TokenPayload {
    id: number
    email: string
    role: string
    branchId: string | null
}

export function generateAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE as any })
}

export function generateRefreshToken(payload: { id: number }) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE as any })
}

export function verifyAccessToken(token: string) {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload
    } catch (error) {
        return null
    }
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: number }
    } catch (error) {
        return null
    }
}
