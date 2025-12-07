import { ModifiedGetListElementsResponse } from 'uiSrc/slices/interfaces/instances'

export interface StateList {
  loading: boolean
  error: string
  data: ModifiedGetListElementsResponse
  updateValue: {
    loading: boolean
    error: string
  }
}
