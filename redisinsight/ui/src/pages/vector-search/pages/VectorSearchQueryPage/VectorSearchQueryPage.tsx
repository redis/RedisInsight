import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { RiSelectOption } from 'uiSrc/components/base/forms/select/RiSelect'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SearchIndexDetailsSource } from 'uiSrc/pages/vector-search/telemetry.constants'

import {
  getIndexDisplayName,
  resolveIndexName,
  encodeIndexNameForUrl,
  decodeIndexNameFromUrl,
} from '../../utils'
import { useRedisearchListData } from '../../hooks'
import { OPEN_INDEX_PANEL_PARAM } from '../../constants'
import { VectorSearchQueryPageParams } from './VectorSearchQueryPage.types'
import { PageHeader, PageContent } from './components'

import * as S from './VectorSearchQueryPage.styles'

export const VectorSearchQueryPage = () => {
  const { instanceId, indexName } = useParams<VectorSearchQueryPageParams>()
  const history = useHistory()
  const location = useLocation()

  const [isIndexPanelOpen, setIsIndexPanelOpen] = useState(
    () =>
      new URLSearchParams(location.search).get(OPEN_INDEX_PANEL_PARAM) ===
      'true',
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get(OPEN_INDEX_PANEL_PARAM) !== 'true') {
      return
    }

    setIsIndexPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
      eventData: {
        databaseId: instanceId,
        source: SearchIndexDetailsSource.KeyDetails,
      },
    })

    params.delete(OPEN_INDEX_PANEL_PARAM)
    history.replace({ ...location, search: params.toString() })
  }, [location.search])

  const { loading, error, stringData: indexes } = useRedisearchListData()

  const decodedIndexName = decodeIndexNameFromUrl(indexName)

  useEffect(() => {
    if (loading !== false || error) {
      return
    }

    const indexExists = indexes.some((name) => name === decodedIndexName)

    if (!indexExists) {
      history.push(Pages.vectorSearch(instanceId))
    }
  }, [loading, error, indexes, decodedIndexName, instanceId, history])

  const indexOptions: RiSelectOption[] = useMemo(
    () =>
      indexes.map((name) => {
        const displayName = getIndexDisplayName(name)
        return { value: displayName, label: displayName }
      }),
    [indexes],
  )

  const handleIndexChange = useCallback(
    (value: string) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_INDEX_CHANGED,
        eventData: { databaseId: instanceId },
      })
      history.push(
        Pages.vectorSearchQuery(
          instanceId,
          encodeIndexNameForUrl(resolveIndexName(value)),
        ),
      )
    },
    [instanceId, history],
  )

  const toggleIndexPanel = useCallback(() => {
    if (!isIndexPanelOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
        eventData: {
          databaseId: instanceId,
          source: SearchIndexDetailsSource.Query,
        },
      })
    }
    setIsIndexPanelOpen((prev) => !prev)
  }, [instanceId, isIndexPanelOpen])

  const closeIndexPanel = useCallback(() => {
    setIsIndexPanelOpen(false)
  }, [])

  return (
    <S.PageContainer data-testid="vector-search-query-page">
      <PageHeader
        indexName={getIndexDisplayName(decodedIndexName)}
        indexOptions={indexOptions}
        isIndexPanelOpen={isIndexPanelOpen}
        onIndexChange={handleIndexChange}
        onToggleIndexPanel={toggleIndexPanel}
      />

      <PageContent
        isIndexPanelOpen={isIndexPanelOpen}
        onCloseIndexPanel={closeIndexPanel}
      />
    </S.PageContainer>
  )
}
