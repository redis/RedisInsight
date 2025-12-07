import throttle from 'lodash/throttle'
import { useEffect } from 'react'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const throttleTimeout = riConfig.app.activityMonitorThrottleTimeout
const windowEvents = ['click', 'keydown', 'scroll', 'touchstart']

const SESSION_TIME_SECONDS = riConfig.app.sessionTtlSeconds
const SESSION_TIME_MS = SESSION_TIME_SECONDS * 1000
const CHECK_SESSION_INTERVAL_MS = 10000

let lastActivityTime: number
let checkInterval: ReturnType<typeof setTimeout> | null = null

const getIsMonitorEnabled = () => !!riConfig.app.activityMonitorOrigin

const onActivity = throttle(() => {
  lastActivityTime = +new Date()

  try {
    // post event to parent window
    window.opener?.postMessage(
      { name: 'setLastActivity' },
      riConfig.app.activityMonitorOrigin,
    )
  } catch {
    // ignore errors
  }
}, throttleTimeout)

export const startActivityMonitor = () => {
  lastActivityTime = +new Date()
  try {
    if (getIsMonitorEnabled()) {
      checkInterval = setInterval(() => {
        const now = +new Date()
        if (now - lastActivityTime >= SESSION_TIME_MS) {
          // expire session
          window.location.href = `${riConfig.app.activityMonitorOrigin}/#/logout`
        }
      }, CHECK_SESSION_INTERVAL_MS)

      windowEvents.forEach((event) => {
        window.addEventListener(event, onActivity, {
          passive: true,
          capture: true,
        })
      })
    }
  } catch {
    // ignore errors
  }
}

export const stopActivityMonitor = () => {
  try {
    if (getIsMonitorEnabled()) {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }

      windowEvents.forEach((event) => {
        window.removeEventListener(event, onActivity, { capture: true })
      })
    }
  } catch {
    // ignore errors
  }
}

export const useActivityMonitor = () => {
  useEffect(() => {
    startActivityMonitor()

    return () => {
      stopActivityMonitor()
    }
  }, [])
}

export default useActivityMonitor
