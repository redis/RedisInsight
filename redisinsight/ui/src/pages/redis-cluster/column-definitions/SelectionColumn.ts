import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'

export const SelectionColumn = () => {
  return getSelectionColumn<InstanceRedisCluster>()
}
