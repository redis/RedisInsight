import {
  VectorSetActionsConfig,
  VectorSetActionTarget,
} from '../../vector-set-element-list/VectorSetElementList.types'
import { SimilaritySearchPrefill } from '../../similarity-search-form'

export interface UseVectorSetActionsConfigParams {
  /** Called after the last element is deleted so the parent can clean up the key. */
  onRemoveKey: () => void
  /** Provided by `useElementDetails` so the View action opens the side drawer. */
  onViewElement: (target: VectorSetActionTarget) => void
}

export interface UseVectorSetActionsConfigResult {
  actionsConfig: VectorSetActionsConfig
  /** Element-mode prefill for the similarity-search form; bumps on each Find-similar click. */
  similarityPrefill: SimilaritySearchPrefill | undefined
}
