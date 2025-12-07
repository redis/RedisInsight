import { Nullable } from 'uiSrc/utils'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import {
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
} from 'apiSrc/modules/settings/dto/settings.dto'

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
