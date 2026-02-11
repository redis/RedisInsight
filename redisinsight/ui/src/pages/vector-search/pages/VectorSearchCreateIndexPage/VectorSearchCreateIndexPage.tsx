import React from 'react'
import { useLocation, useParams, Redirect } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import type { CreateIndexLocationState } from './VectorSearchCreateIndexPage.types'
import { CreateIndexPageProvider } from '../../context/create-index-page'
import { CreateIndexHeader } from './components/CreateIndexHeader'
import { CreateIndexToolbar } from './components/CreateIndexToolbar'
import { CreateIndexContent } from './components/CreateIndexContent'
import { CreateIndexFooter } from './components/CreateIndexFooter'
import * as S from './VectorSearchCreateIndexPage.styles'

/**
 * Vector Search Create Index page.
 * Reads sampleData from route state; redirects when missing.
 */
export const VectorSearchCreateIndexPage = () => {
  const location = useLocation<CreateIndexLocationState>()
  const { instanceId } = useParams<{ instanceId: string }>()

  const sampleData = location.state?.sampleData

  // TODO: Currently we only support creating indexes from sample datasets
  // passed via route state. In the future this will be extended to read
  // a database key from the current connection and derive the index schema
  // from the existing data.
  if (!sampleData) {
    return <Redirect to={Pages.vectorSearch(instanceId)} />
  }

  return (
    <CreateIndexPageProvider instanceId={instanceId} sampleData={sampleData}>
      <S.PageWrapper data-testid="vector-search--create-index--page">
        <CreateIndexHeader />

        <S.CardContainer data-testid="vector-search--create-index--card">
          <CreateIndexToolbar />
          <CreateIndexContent />
          <CreateIndexFooter />
        </S.CardContainer>
      </S.PageWrapper>
    </CreateIndexPageProvider>
  )
}
