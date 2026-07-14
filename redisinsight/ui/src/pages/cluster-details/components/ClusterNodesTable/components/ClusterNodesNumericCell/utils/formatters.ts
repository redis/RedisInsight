import i18n from 'uiSrc/i18n'
import { formatBytes } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { ModifiedClusterNodes } from 'uiSrc/pages/cluster-details/ClusterDetailsPage'

export const displayValueFormatter: Partial<
  Record<keyof ModifiedClusterNodes, (v: number) => string>
> = {
  usedMemory: (v) => formatBytes(v, 3, false).toString(),
  networkInKbps: (v) =>
    `${numberWithSpaces(v)} ${i18n.t('analytics.units.kbps')}`,
  networkOutKbps: (v) =>
    `${numberWithSpaces(v)} ${i18n.t('analytics.units.kbps')}`,
}

export const tooltipContentFormatter: Partial<
  Record<keyof ModifiedClusterNodes, (v: number) => string>
> = {
  usedMemory: (v) =>
    `${numberWithSpaces(v)} ${i18n.t('analytics.units.bytes')}`,
}
