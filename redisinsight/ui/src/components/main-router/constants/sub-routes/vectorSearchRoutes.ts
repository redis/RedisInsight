import { lazy } from 'react'

import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  VectorSearchPage,
  VectorSearchCreateIndexPage,
  VectorSearchQueryPage,
} from 'uiSrc/pages/vector-search'
import { LAZY_LOAD } from '../../config'

const LazyVectorSearchPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchPage'),
)
const LazyVectorSearchCreateIndexPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage'),
)
const LazyVectorSearchQueryPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchQueryPage'),
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
    pageName: PageNames.vectorSearchQuery,
    path: Pages.vectorSearchQuery(':instanceId', ':indexName'),
    component: LAZY_LOAD ? LazyVectorSearchQueryPage : VectorSearchQueryPage,
  },
  {
    pageName: PageNames.vectorSearch,
    path: Pages.vectorSearch(':instanceId'),
    component: LAZY_LOAD ? LazyVectorSearchPage : VectorSearchPage,
  },
]
