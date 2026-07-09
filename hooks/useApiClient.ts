import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useApiClient() {
    const router = useRouter()

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        let token = localStorage.getItem('accessToken')

        const headers = new Headers(options.headers || {})
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        
        // Ensure content type is set for JSON requests if not explicitly passed
        if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
            headers.set('Content-Type', 'application/json')
        }

        let response = await fetch(url, { ...options, headers })

        // If unauthorized, attempt to refresh the token
        if (response.status === 401) {
            try {
                const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
                
                if (refreshRes.ok) {
                    const data = await refreshRes.json()
                    if (data.success && data.accessToken) {
                        localStorage.setItem('accessToken', data.accessToken)
                        // Retry original request with new token
                        headers.set('Authorization', `Bearer ${data.accessToken}`)
                        response = await fetch(url, { ...options, headers })
                    } else {
                        throw new Error('No access token in refresh response')
                    }
                } else {
                    throw new Error('Refresh token invalid or expired')
                }
            } catch (error) {
                console.error("Refresh token failed, logging out:", error)
                localStorage.removeItem('accessToken')
                router.push('/login')
            }
        }

        return response
    }, [router])

    return fetchWithAuth
}
