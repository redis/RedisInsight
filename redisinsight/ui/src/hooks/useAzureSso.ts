import { useState, useEffect, useCallback } from 'react'
import {
  ipcAzureSsoRefreshToken,
  ipcAzureSsoLogout,
} from 'uiSrc/electron/utils'

const AZURE_SSO_STORAGE_KEY = 'azure_sso_user'

// Buffer time before expiration to trigger refresh (5 minutes)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000

export interface AzureSsoUser {
  upn: string
  oid: string
  accessToken: string
  expiresOn: string
}

export interface AzureRedisResource {
  id: string
  name: string
  type: string
  resourceType: 'Microsoft.Cache/redis' | 'Microsoft.Cache/redisEnterprise'
  location: string
  subscriptionName: string
  subscriptionId: string
  properties?: {
    hostName?: string
    sslPort?: number
    port?: number
    redisVersion?: string
    sku?: {
      name: string
      family?: string
      capacity?: number
    }
  }
  sku?: {
    name: string
    capacity?: number
  }
  databases?: AzureRedisDatabase[]
}

export interface AzureRedisDatabase {
  id: string
  name: string
  properties?: {
    port?: number
    clientProtocol?: string
    clusteringPolicy?: string
    accessKeysAuthentication?: 'Enabled' | 'Disabled'
  }
}

export interface AzureResourcesState {
  resources: AzureRedisResource[]
  loading: boolean
  error: string | null
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

  /**
   * Get a valid access token, refreshing if needed.
   * Returns null if refresh fails (user needs to re-login).
   */
  getValidAccessToken: async (): Promise<string | null> => {
    const user = azureSsoStore.getUser()

    if (!user) {
      return null
    }

    const expiresOn = new Date(user.expiresOn)
    const now = new Date()

    // Check if token is still valid (with buffer)
    if (expiresOn.getTime() - now.getTime() > TOKEN_REFRESH_BUFFER_MS) {
      return user.accessToken
    }

    // Token is expired or about to expire, try to refresh
    // eslint-disable-next-line no-console
    console.log('[Azure SSO] Token expired or expiring soon, refreshing...')

    try {
      const result = await ipcAzureSsoRefreshToken()

      if (result?.status === 'succeed' && result?.data) {
        const newUser: AzureSsoUser = {
          upn: result.data.upn,
          oid: result.data.oid,
          accessToken: result.data.accessToken,
          expiresOn: new Date(result.data.expiresOn).toISOString(),
        }
        azureSsoStore.setUser(newUser)
        // eslint-disable-next-line no-console
        console.log('[Azure SSO] Token refreshed successfully')
        return newUser.accessToken
      }

      // Refresh failed, clear user state
      // eslint-disable-next-line no-console
      console.log('[Azure SSO] Token refresh failed, user needs to re-login')
      azureSsoStore.setUser(null)
      return null
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Azure SSO] Token refresh error:', e)
      azureSsoStore.setUser(null)
      return null
    }
  },

  /**
   * Logout - clear local state and MSAL cache
   */
  logout: async (): Promise<void> => {
    try {
      await ipcAzureSsoLogout()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Azure SSO] Logout error:', e)
    }
    azureSsoStore.setUser(null)
    azureResourcesStore.clear()
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
    logout: () => azureSsoStore.logout(),
    getValidAccessToken: () => azureSsoStore.getValidAccessToken(),
  }
}

// Resources store - separate from user store
let globalResourcesState: AzureResourcesState = {
  resources: [],
  loading: false,
  error: null,
}
const resourcesListeners = new Set<(state: AzureResourcesState) => void>()

export const azureResourcesStore = {
  getState: (): AzureResourcesState => globalResourcesState,

  setLoading: (loading: boolean) => {
    globalResourcesState = { ...globalResourcesState, loading }
    resourcesListeners.forEach((listener) => listener(globalResourcesState))
  },

  setResources: (resources: AzureRedisResource[]) => {
    globalResourcesState = {
      resources,
      loading: false,
      error: null,
    }
    resourcesListeners.forEach((listener) => listener(globalResourcesState))
  },

  setError: (error: string) => {
    globalResourcesState = {
      ...globalResourcesState,
      loading: false,
      error,
    }
    resourcesListeners.forEach((listener) => listener(globalResourcesState))
  },

  clear: () => {
    globalResourcesState = { resources: [], loading: false, error: null }
    resourcesListeners.forEach((listener) => listener(globalResourcesState))
  },

  subscribe: (listener: (state: AzureResourcesState) => void) => {
    resourcesListeners.add(listener)
    return () => resourcesListeners.delete(listener)
  },
}

// Hook for Azure resources
export const useAzureResources = () => {
  const [state, setState] = useState<AzureResourcesState>(() =>
    azureResourcesStore.getState()
  )

  useEffect(() => {
    const unsubscribe = azureResourcesStore.subscribe(setState)
    return () => {
      unsubscribe()
    }
  }, [])

  return state
}

