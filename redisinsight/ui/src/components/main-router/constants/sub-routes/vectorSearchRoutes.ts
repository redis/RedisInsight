import { lazy } from 'react'

import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  VectorSearchCreateIndexPageDeprecated,
  VectorSearchPageDeprecated,
} from 'uiSrc/pages/vector-search-deprecated'
import {
  VectorSearchPage,
  VectorSearchCreateIndexPage,
  VectorSearchQueryPage,
} from 'uiSrc/pages/vector-search'
import { LAZY_LOAD } from '../../config'

// Deprecated routes (old implementation)
const LazyVectorSearchPageDeprecated = lazy(
  () => import('uiSrc/pages/vector-search-deprecated/pages/VectorSearchPage'),
)
const LazyVectorSearchCreateIndexPageDeprecated = lazy(
  () =>
    import(
      'uiSrc/pages/vector-search-deprecated/pages/VectorSearchCreateIndexPage'
    ),
)

// New routes
const LazyVectorSearchPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchPage'),
)
const LazyVectorSearchCreateIndexPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage'),
)
const LazyVectorSearchQueryPage = lazy(
  () => import('uiSrc/pages/vector-search/pages/VectorSearchQueryPage'),
)

// Deprecated routes - for manual access to old implementation
// Note: It will be removed after the new feature is stable
export const VECTOR_SEARCH_DEPRECATED_ROUTES: IRoute[] = [
  {
    pageName: PageNames.vectorSearchCreateIndex,
    path: `${Pages.vectorSearchDeprecated(
      ':instanceId',
    )}/${PageNames.vectorSearchCreateIndex}`,
    component: LAZY_LOAD
      ? LazyVectorSearchCreateIndexPageDeprecated
      : VectorSearchCreateIndexPageDeprecated,
  },
  {
    pageName: PageNames.vectorSearchDeprecated,
    path: Pages.vectorSearchDeprecated(':instanceId'),
    component: LAZY_LOAD
      ? LazyVectorSearchPageDeprecated
      : VectorSearchPageDeprecated,
  },
]

// New routes - new implementation behind feature flag
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
