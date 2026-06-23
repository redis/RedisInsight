import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Environment } from 'apiClient'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { appFeatureFlagProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import { ConnectionType, EditDatabaseField } from 'uiSrc/slices/interfaces'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { getProductionSignals, looksLikeProduction } from '../utils'
import { UsePromoteProductionPromptResult } from '../PromoteProductionPrompt.types'

/**
 * Decides whether the connected database qualifies for the production-mode CTA
 * and owns the prompt's open state and button handlers.
 */
export const usePromoteProductionPrompt =
  (): UsePromoteProductionPromptResult => {
    const prodModeEnabled = useAppSelector(appFeatureFlagProdModeSelector)
    const { id, environment, host, tls, connectionType, username } =
      useAppSelector(connectedInstanceSelector)
    const { totalKeys } = useAppSelector(connectedInstanceOverviewSelector)
    const { data: instances } = useAppSelector(instancesSelector)

    const history = useHistory()
    const [dismissed, setDismissed] = useState(false)
    const displayedRef = useRef(false)

    // Wait for the database list to include the connected database before
    // deciding, otherwise `featureDiscovered` is unreliable while it loads.
    const instancesLoaded = instances.some((db) => db.id === id)
    // Once any database is classified, the feature is considered discovered.
    const featureDiscovered = instances.some(
      (db) => !!db.environment && db.environment !== Environment.Unspecified,
    )
    const alreadyActioned = !!localStorageService.get(
      BrowserStorageItem.prodModeCtaActioned,
    )

    const signals = getProductionSignals({
      host,
      tls,
      connectionType,
      username,
      totalKeys,
    })

    const shouldPromote =
      prodModeEnabled &&
      instancesLoaded &&
      !featureDiscovered &&
      !alreadyActioned &&
      environment === Environment.Unspecified &&
      // Sentinel connections have no Environment field in their edit form, so
      // the CTA would lead nowhere useful.
      connectionType !== ConnectionType.Sentinel &&
      looksLikeProduction(signals)

    // Derived (not latched) so the prompt hides again if the database stops
    // qualifying (e.g. the list loads and another database is classified).
    const isOpen = shouldPromote && !dismissed

    useEffect(() => {
      if (isOpen && !displayedRef.current) {
        displayedRef.current = true
        sendEventTelemetry({
          event: TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_DISPLAYED,
          eventData: { databaseId: id, totalKeys, ...signals },
        })
      }
    }, [isOpen])

    // Persist on click (not on display) so the prompt never appears again.
    const markActioned = () =>
      localStorageService.set(BrowserStorageItem.prodModeCtaActioned, true)

    const onDismiss = () => {
      sendEventTelemetry({
        event: TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_NOT_NOW_CLICKED,
        eventData: { databaseId: id },
      })
      markActioned()
      setDismissed(true)
    }

    const onMarkProduction = () => {
      sendEventTelemetry({
        event:
          TelemetryEvent.PROD_MODE_PROMOTION_PROMPT_MARK_AS_PRODUCTION_CLICKED,
        eventData: { databaseId: id },
      })
      markActioned()
      history.push(Pages.homeEditInstance(id, EditDatabaseField.Environment))
    }

    return { isOpen, onDismiss, onMarkProduction }
  }
