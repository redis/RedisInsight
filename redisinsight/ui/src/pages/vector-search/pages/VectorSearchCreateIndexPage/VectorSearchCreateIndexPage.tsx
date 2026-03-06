import React from 'react'
import { useLocation, useParams, Redirect } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import type { CreateIndexLocationState } from './VectorSearchCreateIndexPage.types'
import { CreateIndexMode } from './VectorSearchCreateIndexPage.types'
import {
  isExistingDataState,
  isSampleDataState,
  hasPreselectedKey,
} from '../../utils'
import { CreateIndexPageProvider } from '../../context/create-index-page'
import { CreateIndexHeader } from './components/CreateIndexHeader'
import { CreateIndexContent } from './components/CreateIndexContent'
import { CreateIndexBrowser } from './components/CreateIndexBrowser'
import * as S from './VectorSearchCreateIndexPage.styles'

export const VectorSearchCreateIndexPage = () => {
  const location = useLocation<CreateIndexLocationState>()
  const { instanceId } = useParams<{ instanceId: string }>()

  const state = location.state
  const mode = isExistingDataState(state)
    ? CreateIndexMode.ExistingData
    : CreateIndexMode.SampleData

  const sampleData = isSampleDataState(state) ? state.sampleData : undefined

  if (mode === CreateIndexMode.SampleData && !sampleData) {
    return <Redirect to={Pages.vectorSearch(instanceId)} />
  }

  const showBrowser =
    mode === CreateIndexMode.ExistingData && !hasPreselectedKey(state)

  return (
    <CreateIndexPageProvider
      instanceId={instanceId}
      mode={mode}
      sampleData={sampleData}
      showBrowser={showBrowser}
    >
      <S.PageWrapper data-testid="vector-search--create-index--page">
        <CreateIndexBrowser />

        <S.RightPanel>
          <CreateIndexHeader />
          <CreateIndexContent />
        </S.RightPanel>
      </S.PageWrapper>
    </CreateIndexPageProvider>
  )
}
