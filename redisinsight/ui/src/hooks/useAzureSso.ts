import { useState, useEffect, useCallback } from 'react'

const AZURE_SSO_STORAGE_KEY = 'azure_sso_user'

export interface AzureSsoUser {
  upn: string
  oid: string
  accessToken: string
  expiresOn: string
}

export const useAzureSso = () => {
  const [user, setUser] = useState<AzureSsoUser | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(AZURE_SSO_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AzureSsoUser
        // Check if token is expired
        if (new Date(parsed.expiresOn) > new Date()) {
          setUser(parsed)
        } else {
          // Token expired, clear it
          localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
      }
    }
  }, [])

  const login = useCallback((userData: AzureSsoUser) => {
    setUser(userData)
    localStorage.setItem(AZURE_SSO_STORAGE_KEY, JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
  }, [])

  return {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  }
}

// Singleton pattern to share state across components
let globalUser: AzureSsoUser | null = null
const listeners = new Set<(user: AzureSsoUser | null) => void>()

export const azureSsoStore = {
  getUser: (): AzureSsoUser | null => {
    if (globalUser) return globalUser
    
    const stored = localStorage.getItem(AZURE_SSO_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AzureSsoUser
        if (new Date(parsed.expiresOn) > new Date()) {
          globalUser = parsed
          return parsed
        }
        localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
      } catch {
        localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
      }
    }
    return null
  },

  setUser: (user: AzureSsoUser | null) => {
    globalUser = user
    if (user) {
      localStorage.setItem(AZURE_SSO_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AZURE_SSO_STORAGE_KEY)
    }
    listeners.forEach((listener) => listener(user))
  },

  subscribe: (listener: (user: AzureSsoUser | null) => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

// Hook that uses the store
export const useAzureSsoStore = () => {
  const [user, setUser] = useState<AzureSsoUser | null>(() => 
    azureSsoStore.getUser()
  )

  useEffect(() => {
    const unsubscribe = azureSsoStore.subscribe(setUser)
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    user,
    isLoggedIn: !!user,
    login: (userData: AzureSsoUser) => azureSsoStore.setUser(userData),
    logout: () => azureSsoStore.setUser(null),
  }
}

