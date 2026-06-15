import { SubmitElement } from '../../vector-set-element-form'

export interface UseAddElementsResult {
  loading: boolean
  vectorDim?: number
  submitElements: (elements: SubmitElement[], onSuccess?: () => void) => void
}
