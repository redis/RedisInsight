import { Nullable } from 'uiSrc/utils'
import {
  CloudUser,
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
} from 'apiClient'

export interface StateUserSettings {
  loading: boolean
  error: string
  isShowConceptsPopup: Nullable<boolean>
  config: Nullable<GetAppSettingsResponse>
  spec: Nullable<GetAgreementsSpecResponse>
  workbench: {
    cleanup: boolean
  }
}

export interface StateUserProfile {
  loading: boolean
  error: string
  data?: CloudUser
}
