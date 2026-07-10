import React from 'react'
import { useLocation, useParams, Redirect } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { Loader } from 'uiSrc/components/base/display'

import { CreateIndexMode } from './VectorSearchCreateIndexPage.types'
import {
  isExistingDataState,
  isSampleDataState,
  hasPreselectedKey,
  parseCreateIndexSearchParams,
} from '../../utils'
import { useVectorSearch } from '../../context/vector-search'
import { CreateIndexPageProvider } from '../../context/create-index-page'
import { CreateIndexOnboardingProvider } from '../../context/create-index-onboarding'
import { CreateIndexHeader } from './components/CreateIndexHeader'
import { CreateIndexContent } from './components/CreateIndexContent'
import { CreateIndexBrowser } from './components/CreateIndexBrowser'
import * as S from './VectorSearchCreateIndexPage.styles'

export const VectorSearchCreateIndexPage = () => {
  const { search } = useLocation()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { hasExistingKeys, hasExistingKeysLoading } = useVectorSearch()

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
  const isBrowseFlow = mode === CreateIndexMode.ExistingData && !preselected

  if (isBrowseFlow && hasExistingKeysLoading) {
    return (
      <S.PageWrapper
        align="center"
        justify="center"
        data-testid="vector-search--create-index--loading"
      >
        <Loader size="xl" />
      </S.PageWrapper>
    )
  }

  // With no keys in the database the browser panel is useless — switch to
  // manual creation, where the user defines the index fields themselves.
  const isManualCreation = isBrowseFlow && !hasExistingKeys
  const showBrowser = isBrowseFlow && hasExistingKeys

  return (
    <CreateIndexPageProvider
      instanceId={instanceId}
      mode={mode}
      sampleData={sampleData}
      showBrowser={showBrowser}
      isManualCreation={isManualCreation}
      initialKey={preselected ? existingState?.initialKey : undefined}
      initialKeyType={preselected ? existingState?.initialKeyType : undefined}
      initialPrefix={preselected ? existingState?.initialPrefix : undefined}
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
