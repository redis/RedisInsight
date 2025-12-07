import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'

export const selectionColumn = () => {
  return getSelectionColumn<InstanceRedisCluster>()
}

