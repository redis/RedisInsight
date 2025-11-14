import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import {
  alertColumn,
  idColumn,
  numberOfDbsColumn,
  providerColumn,
  regionColumn,
  selectionColumn,
  statusColumn,
  subscriptionColumn,
  typeColumn,
} from 'uiSrc/pages/autodiscover-cloud/column-definitions'

export const colFactory = (
  items: RedisCloudSubscription[],
): ColumnDef<RedisCloudSubscription>[] => {
  const cols: ColumnDef<RedisCloudSubscription>[] = [
    idColumn(),
    subscriptionColumn(),
    typeColumn(),
    providerColumn(),
    regionColumn(),
    numberOfDbsColumn(),
    statusColumn(),
  ]
  if (items.length > 0) {
    cols.unshift(alertColumn())
    cols.unshift(selectionColumn())
  }
  return cols
}
