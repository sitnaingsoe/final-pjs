import { NextResponse } from 'next/server'
import { verifyAccessToken, TokenPayload } from '@/lib/tokens'

/**
 * Mobile API routes များအတွက် JWT Bearer Token ကို စစ်ဆေးသည့် utility
 * Authorization: Bearer <accessToken> header ကို ဖတ်ပြီး verify လုပ်ပေးသည်
 */
export function verifyMobileAuth(request: Request): TokenPayload | null {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }

    const token = authHeader.split(' ')[1]
    if (!token) return null

    return verifyAccessToken(token)
}

/**
 * Auth မရှိပါက 401 response ပြန်ပေးသည့် helper
 * ရှိပါက TokenPayload ကို return ပြန်ပေးသည်
 */
export function requireMobileAuth(request: Request): TokenPayload | NextResponse {
    const payload = verifyMobileAuth(request)
    if (!payload) {
        return NextResponse.json(
            { success: false, error: "Unauthorized - Invalid or missing token" },
            { status: 401 }
        )
    }
    return payload
}

/**
 * Type guard: NextResponse ဟုတ်/မဟုတ် စစ်ဆေးရန်
 */
export function isAuthError(result: TokenPayload | NextResponse): result is NextResponse {
    return result instanceof NextResponse
}
