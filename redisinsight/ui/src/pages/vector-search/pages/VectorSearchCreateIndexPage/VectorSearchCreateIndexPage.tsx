import React from 'react'
import { useLocation, useParams, Redirect } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import { CreateIndexMode } from './VectorSearchCreateIndexPage.types'
import {
  isExistingDataState,
  isSampleDataState,
  hasPreselectedKey,
  parseCreateIndexSearchParams,
} from '../../utils'
import { CreateIndexPageProvider } from '../../context/create-index-page'
import { CreateIndexOnboardingProvider } from '../../context/create-index-onboarding'
import { CreateIndexHeader } from './components/CreateIndexHeader'
import { CreateIndexContent } from './components/CreateIndexContent'
import { CreateIndexBrowser } from './components/CreateIndexBrowser'
import * as S from './VectorSearchCreateIndexPage.styles'

export const VectorSearchCreateIndexPage = () => {
  const { search } = useLocation()
  const { instanceId } = useParams<{ instanceId: string }>()

  const state = parseCreateIndexSearchParams(search)
  const mode = isExistingDataState(state)
    ? CreateIndexMode.ExistingData
    : CreateIndexMode.SampleData

  const sampleData = isSampleDataState(state) ? state.sampleData : undefined

  if (mode === CreateIndexMode.SampleData && !sampleData) {
    return <Redirect to={Pages.vectorSearch(instanceId)} />
  }

  const existingState = isExistingDataState(state) ? state : undefined
  const preselected = hasPreselectedKey(state)
  const showBrowser = mode === CreateIndexMode.ExistingData && !preselected

  return (
    <CreateIndexPageProvider
      instanceId={instanceId}
      mode={mode}
      sampleData={sampleData}
      showBrowser={showBrowser}
      initialKey={preselected ? existingState?.initialKey : undefined}
      initialKeyType={existingState?.initialKeyType}
      initialPrefix={existingState?.initialPrefix}
    >
      <CreateIndexOnboardingProvider instanceId={instanceId}>
        <S.PageWrapper data-testid="vector-search--create-index--page">
          <CreateIndexBrowser />

          <S.RightPanel>
            <CreateIndexHeader />
            <CreateIndexContent />
          </S.RightPanel>
        </S.PageWrapper>
      </CreateIndexOnboardingProvider>
    </CreateIndexPageProvider>
  )
}
