import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { RiSelectOption } from 'uiSrc/components/base/forms/select/RiSelect'
import { Pages } from 'uiSrc/constants'

import {
  getIndexDisplayName,
  resolveIndexName,
  encodeIndexNameForUrl,
  decodeIndexNameFromUrl,
} from '../../utils'
import { useRedisearchListData } from '../../hooks'
import { VectorSearchQueryPageParams } from './VectorSearchQueryPage.types'
import { PageHeader, PageContent } from './components'

import * as S from './VectorSearchQueryPage.styles'

export const VectorSearchQueryPage = () => {
  const { instanceId, indexName } = useParams<VectorSearchQueryPageParams>()
  const history = useHistory()

  const [isIndexPanelOpen, setIsIndexPanelOpen] = useState(false)

  const { stringData: indexes } = useRedisearchListData()

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
    setIsIndexPanelOpen((prev) => !prev)
  }, [])

  const closeIndexPanel = useCallback(() => {
    setIsIndexPanelOpen(false)
  }, [])

  return (
    <S.PageContainer data-testid="vector-search-query-page">
      <PageHeader
        indexName={getIndexDisplayName(decodeIndexNameFromUrl(indexName))}
        indexOptions={indexOptions}
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
