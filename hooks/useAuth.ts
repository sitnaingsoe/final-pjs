import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
    const router = useRouter()
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken')
        if (storedToken) {
            setToken(storedToken)
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const login = (accessToken: string) => {
        localStorage.setItem('accessToken', accessToken)
        setToken(accessToken)
        setIsAuthenticated(true)
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error('Logout request failed', e)
        } finally {
            localStorage.removeItem('accessToken')
            setToken(null)
            setIsAuthenticated(false)
            router.push('/login')
        }
    }

    return { token, isAuthenticated, isLoading, login, logout }
}
