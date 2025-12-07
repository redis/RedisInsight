import { formatBytes } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { ModifiedClusterNodes } from 'uiSrc/pages/cluster-details/ClusterDetailsPage'

export const displayValueFormatter: Partial<
  Record<keyof ModifiedClusterNodes, (v: number) => string>
> = {
  usedMemory: (v) => formatBytes(v, 3, false).toString(),
  networkInKbps: (v) => `${numberWithSpaces(v)} kb/s`,
  networkOutKbps: (v) => `${numberWithSpaces(v)} kb/s`,
}

export const tooltipContentFormatter: Partial<
  Record<keyof ModifiedClusterNodes, (v: number) => string>
> = {
  usedMemory: (v) => `${numberWithSpaces(v)} B`,
}
