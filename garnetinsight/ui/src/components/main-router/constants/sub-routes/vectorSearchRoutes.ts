import { lazy } from 'react'

import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { VectorSearchCreateIndexPage, VectorSearchPage } from 'uiSrc/pages'
import { LAZY_LOAD } from '../../config'

const LazyVectorSearchPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchPage'),
)
const LazyVectorSearchCreateIndexPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage'),
)

export const VECTOR_SEARCH_ROUTES: IRoute[] = [
  {
    pageName: PageNames.vectorSearchCreateIndex,
    path: Pages.vectorSearchCreateIndex(':instanceId'),
    component: LAZY_LOAD
      ? LazyVectorSearchCreateIndexPage
      : VectorSearchCreateIndexPage,
  },
  {
    pageName: PageNames.vectorSearch,
    path: Pages.vectorSearch(':instanceId'),
    component: LAZY_LOAD ? LazyVectorSearchPage : VectorSearchPage,
  },
]
